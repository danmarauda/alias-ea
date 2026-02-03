import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Organization Management Functions
 * Handles organization CRUD, membership management, and settings
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get organization by ID
 */
export const getById = query({
  args: { organizationId: v.id("organizations") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args): Promise<Doc<"organizations"> | null> => {
    return await ctx.db.get(args.organizationId);
  },
});

/**
 * Get organization by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args): Promise<Doc<"organizations"> | null> => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get organization with members
 */
export const getWithMembers = query({
  args: { organizationId: v.id("organizations") },
  returns: v.union(v.null(), v.object({
    organization: v.any(),
    members: v.array(v.any()),
    settings: v.optional(v.any()),
  })),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const organization = await ctx.db.get(args.organizationId);
    if (!organization || !organization.isActive) return null;

    // Check if user is a member
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!currentUser) return null;

    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", currentUser._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      throw new Error("Not a member of this organization");
    }

    // Get all active members
    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organization", (q) => 
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    const activeMemberships = memberships.filter((m) => m.isActive);

    const membersWithUsers = await Promise.all(
      activeMemberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          ...m,
          user,
        };
      })
    );

    // Get settings if they exist
    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .unique();

    return {
      organization,
      members: membersWithUsers,
      settings: settings ?? undefined,
    };
  },
});

/**
 * List organizations for current user
 */
export const listForCurrentUser = query({
  args: {},
  returns: v.array(v.object({
    organization: v.any(),
    membership: v.any(),
  })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    const results = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.organizationId);
        if (!org || !org.isActive) return null;
        return {
          organization: org,
          membership: m,
        };
      })
    );

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  },
});

/**
 * Get pending invitations for organization
 */
export const getPendingInvitations = query({
  args: { organizationId: v.id("organizations") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Verify caller is admin/owner
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) return [];
    if (!["owner", "admin"].includes(membership.role)) return [];

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const pendingInvitations = invitations.filter(
      (i) => i.status === "pending" && i.expiresAt > Date.now()
    );

    return await Promise.all(
      pendingInvitations.map(async (i) => ({
        ...i,
        invitedByUser: await ctx.db.get(i.invitedBy),
      }))
    );
  },
});

/**
 * Check if slug is available
 */
export const checkSlugAvailability = query({
  args: { slug: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return !existing;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new organization
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    workosOrgId: v.optional(v.string()),
  },
  returns: v.id("organizations"),
  handler: async (ctx, args): Promise<Id<"organizations">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check slug availability
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("Organization slug already taken");
    }

    const now = Date.now();

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      workosOrgId: args.workosOrgId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      logoUrl: args.logoUrl,
      website: args.website,
      settings: {
        allowGuestAccess: false,
        requireApproval: true,
        defaultRole: "member",
      },
      isActive: true,
      isPersonal: false,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Add creator as owner
    await ctx.db.insert("organizationMemberships", {
      userId: user._id,
      organizationId,
      role: "owner",
      isActive: true,
      joinedAt: now,
      lastAccessedAt: now,
    });

    // Create default settings
    await ctx.db.insert("organizationSettings", {
      organizationId,
      features: {
        aiChat: true,
        voiceAgent: true,
        customIntegrations: false,
        analytics: true,
      },
      limits: {
        maxMembers: 10,
        maxProjects: 5,
        maxStorage: 1024, // 1GB
      },
      billing: {
        plan: "free",
      },
      updatedAt: now,
      updatedBy: user._id,
    });

    // Log creation
    await ctx.runMutation(api.auditLogs.create, {
      organizationId,
      userId: user._id,
      action: "organization.created",
      resource: "organization",
      resourceId: organizationId,
      metadata: {
        name: args.name,
        slug: args.slug,
      },
    });

    return organizationId;
  },
});

/**
 * Create personal organization (internal use)
 */
export const createPersonal = internalMutation({
  args: {
    userId: v.id("users"),
    userName: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"organizations">> => {
    const now = Date.now();
    const slug = `personal-${args.userId.slice(-8)}-${now.toString(36)}`;

    const organizationId = await ctx.db.insert("organizations", {
      name: `${args.userName}'s Personal`,
      slug,
      isActive: true,
      isPersonal: true,
      settings: {
        allowGuestAccess: false,
        requireApproval: false,
        defaultRole: "owner",
      },
      createdAt: now,
      updatedAt: now,
      createdBy: args.userId,
    });

    await ctx.db.insert("organizationSettings", {
      organizationId,
      features: {
        aiChat: true,
        voiceAgent: true,
        customIntegrations: true,
        analytics: true,
      },
      limits: {
        maxMembers: 1,
        maxProjects: 10,
        maxStorage: 5120, // 5GB
      },
      billing: {
        plan: "free",
      },
      updatedAt: now,
      updatedBy: args.userId,
    });

    return organizationId;
  },
});

/**
 * Update organization details
 */
export const update = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    settings: v.optional(v.object({
      allowGuestAccess: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      defaultRole: v.optional(v.union(
        v.literal("owner"),
        v.literal("admin"),
        v.literal("member"),
        v.literal("viewer")
      )),
    })),
  },
  returns: v.id("organizations"),
  handler: async (ctx, args): Promise<Id<"organizations">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check permissions (owner or admin)
    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      throw new Error("Not a member of this organization");
    }

    if (!["owner", "admin"].includes(membership.role)) {
      throw new Error("Insufficient permissions");
    }

    const updateData: Partial<Doc<"organizations">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.logoUrl !== undefined) updateData.logoUrl = args.logoUrl;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.settings !== undefined) {
      const org = await ctx.db.get(args.organizationId);
      if (org) {
        updateData.settings = {
          ...org.settings,
          ...args.settings,
        };
      }
    }

    await ctx.db.patch(args.organizationId, updateData);

    // Log update
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: args.organizationId,
      userId: user._id,
      action: "organization.updated",
      resource: "organization",
      resourceId: args.organizationId,
      metadata: {
        updatedFields: Object.keys(args).filter((k) => k !== "organizationId"),
      },
    });

    return args.organizationId;
  },
});

/**
 * Delete organization (owner only)
 */
export const remove = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify owner
    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only the owner can delete an organization");
    }

    const org = await ctx.db.get(args.organizationId);
    if (!org) {
      throw new Error("Organization not found");
    }

    if (org.isPersonal) {
      throw new Error("Cannot delete personal organization");
    }

    const now = Date.now();

    // Soft delete - deactivate organization
    await ctx.db.patch(args.organizationId, {
      isActive: false,
      updatedAt: now,
    });

    // Deactivate all memberships
    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    for (const m of memberships) {
      await ctx.db.patch(m._id, {
        isActive: false,
        lastAccessedAt: now,
      });
    }

    // Log deletion
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: args.organizationId,
      userId: user._id,
      action: "organization.deleted",
      resource: "organization",
      resourceId: args.organizationId,
    });
  },
});

/**
 * Transfer organization ownership
 */
export const transferOwnership = mutation({
  args: {
    organizationId: v.id("organizations"),
    newOwnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify current user is owner
    const currentMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", currentUser._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!currentMembership || currentMembership.role !== "owner") {
      throw new Error("Only the owner can transfer ownership");
    }

    // Verify new owner is a member
    const newOwnerMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", args.newOwnerId).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!newOwnerMembership || !newOwnerMembership.isActive) {
      throw new Error("New owner must be an active member");
    }

    const now = Date.now();

    // Demote current owner to admin
    await ctx.db.patch(currentMembership._id, {
      role: "admin",
    });

    // Promote new owner
    await ctx.db.patch(newOwnerMembership._id, {
      role: "owner",
    });

    // Update organization
    await ctx.db.patch(args.organizationId, {
      updatedAt: now,
    });

    // Log transfer
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: args.organizationId,
      userId: currentUser._id,
      action: "organization.ownership_transferred",
      resource: "organization",
      resourceId: args.organizationId,
      metadata: {
        previousOwner: currentUser._id,
        newOwner: args.newOwnerId,
      },
    });
  },
});
