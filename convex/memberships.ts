import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Organization Membership Functions
 * Handles member management, role updates, and access control
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get membership details for current user in an organization
 */
export const getCurrentUserMembership = query({
  args: { organizationId: v.id("organizations") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args): Promise<Doc<"organizationMemberships"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();
  },
});

/**
 * Check if user has required role in organization
 */
export const checkPermission = query({
  args: {
    organizationId: v.id("organizations"),
    requiredRole: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return false;

    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) return false;

    const roleHierarchy = ["viewer", "member", "admin", "owner"];
    const userRoleIndex = roleHierarchy.indexOf(membership.role);
    const requiredRoleIndex = roleHierarchy.indexOf(args.requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  },
});

/**
 * Get all members of an organization
 */
export const getOrganizationMembers = query({
  args: { organizationId: v.id("organizations") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    // Verify membership
    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) return [];

    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const activeMemberships = memberships.filter((m) => m.isActive);

    return await Promise.all(
      activeMemberships.map(async (m) => ({
        ...m,
        user: await ctx.db.get(m.userId),
      }))
    );
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Invite a user to an organization
 */
export const inviteMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  returns: v.id("invitations"),
  handler: async (ctx, args): Promise<Id<"invitations">> => {
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

    // Check permissions (owner or admin can invite)
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
      throw new Error("Insufficient permissions to invite members");
    }

    // Only owner can invite admins
    if (args.role === "admin" && membership.role !== "owner") {
      throw new Error("Only owners can invite admins");
    }

    // Check if user is already a member
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      const existingMembership = await ctx.db
        .query("organizationMemberships")
        .withIndex("by_user_and_org", (q) => 
          q.eq("userId", existingUser._id).eq("organizationId", args.organizationId)
        )
        .unique();

      if (existingMembership?.isActive) {
        throw new Error("User is already a member of this organization");
      }
    }

    // Check for existing pending invitation
    const existingInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_email_and_status", (q) => 
        q.eq("email", args.email).eq("status", "pending")
      )
      .collect();

    const existingPending = existingInvitations.find(
      (i) => i.organizationId === args.organizationId && i.expiresAt > Date.now()
    );

    if (existingPending) {
      throw new Error("An invitation is already pending for this email");
    }

    const now = Date.now();

    // Create invitation
    const invitationId = await ctx.db.insert("invitations", {
      organizationId: args.organizationId,
      invitedBy: user._id,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      status: "pending",
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
      createdAt: now,
    });

    // Log invitation
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: args.organizationId,
      userId: user._id,
      action: "member.invited",
      resource: "invitation",
      resourceId: invitationId,
      metadata: {
        email: args.email,
        role: args.role,
      },
    });

    return invitationId;
  },
});

/**
 * Accept an invitation
 */
export const acceptInvitation = mutation({
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

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer pending");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("This invitation is for a different email address");
    }

    const now = Date.now();

    // Check for existing membership
    const existingMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", invitation.organizationId)
      )
      .unique();

    if (existingMembership) {
      // Reactivate if inactive
      await ctx.db.patch(existingMembership._id, {
        isActive: true,
        role: invitation.role,
        joinedAt: now,
        lastAccessedAt: now,
        invitedBy: invitation.invitedBy,
      });
    } else {
      // Create new membership
      await ctx.db.insert("organizationMemberships", {
        userId: user._id,
        organizationId: invitation.organizationId,
        role: invitation.role,
        isActive: true,
        joinedAt: now,
        lastAccessedAt: now,
        invitedBy: invitation.invitedBy,
      });
    }

    // Update invitation
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      respondedAt: now,
    });

    // Log acceptance
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: invitation.organizationId,
      userId: user._id,
      action: "member.invitation_accepted",
      resource: "invitation",
      resourceId: invitation._id,
      metadata: {
        role: invitation.role,
      },
    });
  },
});

/**
 * Decline an invitation
 */
export const declineInvitation = mutation({
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

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer pending");
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("This invitation is for a different email address");
    }

    const now = Date.now();

    await ctx.db.patch(invitation._id, {
      status: "declined",
      respondedAt: now,
    });

    // Log decline
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: invitation.organizationId,
      userId: user._id,
      action: "member.invitation_declined",
      resource: "invitation",
      resourceId: invitation._id,
    });
  },
});

/**
 * Cancel an invitation (admin/owner only)
 */
export const cancelInvitation = mutation({
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

    await ctx.db.delete(invitation._id);

    // Log cancellation
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: invitation.organizationId,
      userId: user._id,
      action: "member.invitation_cancelled",
      resource: "invitation",
      resourceId: invitation._id,
    });
  },
});

/**
 * Update member role
 */
export const updateRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
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

    // Get current user's membership
    const currentMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", currentUser._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!currentMembership || !currentMembership.isActive) {
      throw new Error("Not a member of this organization");
    }

    // Permission checks
    if (args.role === "owner") {
      throw new Error("Use transferOwnership to change the owner");
    }

    if (args.role === "admin" && currentMembership.role !== "owner") {
      throw new Error("Only owners can assign admin roles");
    }

    if (!["owner", "admin"].includes(currentMembership.role)) {
      throw new Error("Insufficient permissions to update roles");
    }

    // Get target membership
    const targetMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!targetMembership || !targetMembership.isActive) {
      throw new Error("Target user is not an active member");
    }

    if (targetMembership.role === "owner") {
      throw new Error("Cannot change the owner's role");
    }

    await ctx.db.patch(targetMembership._id, { role: args.role });

    // Log role update
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: args.organizationId,
      userId: currentUser._id,
      action: "member.role_updated",
      resource: "organizationMembership",
      resourceId: targetMembership._id,
      metadata: {
        targetUser: args.userId,
        previousRole: targetMembership.role,
        newRole: args.role,
      },
    });
  },
});

/**
 * Remove member from organization
 */
export const removeMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
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

    const isSelfRemoval = currentUser._id === args.userId;

    // Get current user's membership
    const currentMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", currentUser._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!currentMembership || !currentMembership.isActive) {
      throw new Error("Not a member of this organization");
    }

    // Self-removal is allowed for non-owners
    if (!isSelfRemoval) {
      if (currentMembership.role === "viewer" || currentMembership.role === "member") {
        throw new Error("Insufficient permissions to remove members");
      }
    }

    // Get target membership
    const targetMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!targetMembership || !targetMembership.isActive) {
      throw new Error("Target user is not an active member");
    }

    // Cannot remove owner
    if (targetMembership.role === "owner") {
      throw new Error("Cannot remove the organization owner");
    }

    // Admins can only remove members/viewers, not other admins
    if (
      currentMembership.role === "admin" && 
      ["admin", "owner"].includes(targetMembership.role)
    ) {
      throw new Error("Admins cannot remove other admins or the owner");
    }

    const now = Date.now();

    await ctx.db.patch(targetMembership._id, {
      isActive: false,
      lastAccessedAt: now,
    });

    // Log removal
    await ctx.runMutation(api.auditLogs.create, {
      organizationId: args.organizationId,
      userId: currentUser._id,
      action: "member.removed",
      resource: "organizationMembership",
      resourceId: targetMembership._id,
      metadata: {
        removedUser: args.userId,
        removedBy: currentUser._id,
      },
    });
  },
});

/**
 * Update last accessed timestamp
 */
export const updateLastAccessed = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return;

    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (membership) {
      await ctx.db.patch(membership._id, {
        lastAccessedAt: Date.now(),
      });
    }
  },
});
