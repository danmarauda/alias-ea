import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Complete WorkOS + Convex Schema
 * Supports multi-tenant organizations with role-based access control
 */

// Role types for organization members
export const organizationRoles = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
  v.literal("viewer")
);

// Invitation status
export const invitationStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("expired")
);

export default defineSchema({
  /**
   * Users - Synced from WorkOS
   * Contains profile information and preferences
   */
  users: defineTable({
    // WorkOS identifiers
    workosId: v.string(),
    tokenIdentifier: v.string(),

    // Profile
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),

    // Preferences
    preferences: v.optional(v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
      notifications: v.optional(v.boolean()),
      language: v.optional(v.string()),
    })),

    // Payment & Subscription (Stripe)
    subscriptionTier: v.optional(v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise")
    )),
    stripeCustomerId: v.optional(v.string()),

    // Status
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()), // Unix timestamp

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  /**
   * Organizations - Multi-tenant support
   * Each org maps to a WorkOS organization
   */
  organizations: defineTable({
    // WorkOS organization ID
    workosOrgId: v.optional(v.string()),
    
    // Organization details
    name: v.string(),
    slug: v.string(), // URL-friendly name
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    
    // Settings
    settings: v.optional(v.object({
      allowGuestAccess: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      defaultRole: v.optional(organizationRoles),
    })),
    
    // Status
    isActive: v.boolean(),
    isPersonal: v.boolean(), // Personal org for individual users
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workos_org_id", ["workosOrgId"])
    .index("by_slug", ["slug"])
    .index("by_creator", ["createdBy"]),

  /**
   * Organization Memberships
   * Many-to-many relationship between users and organizations
   */
  organizationMemberships: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    
    // Role in the organization
    role: organizationRoles,
    
    // Membership status
    isActive: v.boolean(),
    
    // Metadata
    joinedAt: v.number(),
    invitedBy: v.optional(v.id("users")),
    lastAccessedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_user_and_org", ["userId", "organizationId"])
    .index("by_user_active", ["userId", "isActive"]),

  /**
   * Invitations
   * Pending invitations to join organizations
   */
  invitations: defineTable({
    organizationId: v.id("organizations"),
    invitedBy: v.id("users"),
    
    // Invitee details
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    
    // Invitation details
    role: organizationRoles,
    status: invitationStatus,
    
    // WorkOS invitation ID (if using WorkOS)
    workosInvitationId: v.optional(v.string()),
    
    // Expiration
    expiresAt: v.number(),
    
    // Metadata
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_email_and_status", ["email", "status"]),

  /**
   * Sessions
   * Track user sessions for security and audit
   */
  sessions: defineTable({
    userId: v.id("users"),
    
    // Session details
    workosSessionId: v.optional(v.string()),
    
    // Device/Client info
    deviceType: v.optional(v.string()),
    deviceName: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    
    // Status
    isActive: v.boolean(),
    
    // Timestamps
    startedAt: v.number(),
    lastActiveAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_workos_session", ["workosSessionId"]),

  /**
   * Audit Logs
   * Track important actions within organizations
   */
  auditLogs: defineTable({
    organizationId: v.optional(v.id("organizations")),
    userId: v.optional(v.id("users")),
    
    // Action details
    action: v.string(), // e.g., "user.invited", "org.settings_changed"
    resource: v.string(), // e.g., "user", "organization", "project"
    resourceId: v.optional(v.string()),
    
    // Context
    metadata: v.optional(v.record(v.string(), v.any())),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    
    // Timestamp
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_organization_and_time", ["organizationId", "createdAt"]),

  /**
   * Organization Settings
   * Extended settings for organizations
   */
  organizationSettings: defineTable({
    organizationId: v.id("organizations"),
    
    // Feature flags
    features: v.optional(v.object({
      aiChat: v.optional(v.boolean()),
      voiceAgent: v.optional(v.boolean()),
      customIntegrations: v.optional(v.boolean()),
      analytics: v.optional(v.boolean()),
    })),
    
    // Limits
    limits: v.optional(v.object({
      maxMembers: v.optional(v.number()),
      maxProjects: v.optional(v.number()),
      maxStorage: v.optional(v.number()), // in MB
    })),
    
    // Billing
    billing: v.optional(v.object({
      plan: v.optional(v.union(
        v.literal("free"),
        v.literal("starter"),
        v.literal("pro"),
        v.literal("enterprise")
      )),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
    })),
    
    // Metadata
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_organization", ["organizationId"]),

  /**
   * Subscriptions - Stripe integration
   * Track user subscriptions and payment history
   */
  subscriptions: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),

    // Subscription details
    tier: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("past_due"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("incomplete")
    ),

    // Billing period
    period: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),
    currency: v.optional(v.string()),
    price: v.optional(v.number()), // Price in cents

    // Stripe integration
    stripeSubscriptionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),

    // Dates
    startedAt: v.number(),
    expiresAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),

    // Metadata
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  /**
   * Payment History - Track all payment events
   */
  paymentHistory: defineTable({
    userId: v.id("users"),
    subscriptionId: v.optional(v.id("subscriptions")),

    // Payment details
    provider: v.literal("stripe"),
    providerTransactionId: v.string(),

    amount: v.number(), // in cents
    currency: v.string(),

    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),

    // Metadata
    description: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),

    // Timestamps
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["subscriptionId"])
    .index("by_provider_transaction", ["providerTransactionId"])
    .index("by_status", ["status"]),
});
