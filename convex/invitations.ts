import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Invitation Management Functions
 * Handles listing and managing invitations
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get pending invitations for current user
 */
export const getPendingForCurrentUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email_and_status", (q) => 
        q.eq("email", user.email).eq("status", "pending")
      )
      .collect();

    const validInvitations = invitations.filter((i) => i.expiresAt > Date.now());

    return await Promise.all(
      validInvitations.map(async (i) => ({
        ...i,
        organization: await ctx.db.get(i.organizationId),
        invitedByUser: await ctx.db.get(i.invitedBy),
      }))
    );
  },
});

/**
 * Get invitation by ID
 */
export const getById = query({
  args: { invitationId: v.id("invitations") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args): Promise<Doc<"invitations"> | null> => {
    return await ctx.db.get(args.invitationId);
  },
});

/**
 * Validate invitation (check if valid and return details)
 */
export const validate = query({
  args: { invitationId: v.id("invitations") },
  returns: v.union(v.null(), v.object({
    valid: v.boolean(),
    invitation: v.optional(v.any()),
    organization: v.optional(v.any()),
    error: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    
    if (!invitation) {
      return { valid: false, error: "Invitation not found" };
    }

    if (invitation.status !== "pending") {
      return { valid: false, error: `Invitation is ${invitation.status}` };
    }

    if (invitation.expiresAt < Date.now()) {
      return { valid: false, error: "Invitation has expired" };
    }

    const organization = await ctx.db.get(invitation.organizationId);
    if (!organization || !organization.isActive) {
      return { valid: false, error: "Organization no longer exists" };
    }

    return {
      valid: true,
      invitation,
      organization,
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Resend invitation (refreshes expiration)
 */
export const resend = mutation({
  args: { invitationId: v.id("invitations") },
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

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check permissions
    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", invitation.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      throw new Error("Not a member of this organization");
    }

    if (!["owner", "admin"].includes(membership.role)) {
      throw new Error("Insufficient permissions");
    }

    // Extend expiration by 7 days
    await ctx.db.patch(invitation._id, {
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
  },
});

/**
 * Clean up expired invitations (can be called periodically)
 */
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return;

    const now = Date.now();

    // Mark expired invitations
    const pendingInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    for (const invitation of pendingInvitations) {
      if (invitation.expiresAt < now) {
        await ctx.db.patch(invitation._id, {
          status: "expired",
        });
      }
    }
  },
});
