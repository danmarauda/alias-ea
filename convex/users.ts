import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

/**
 * User Management Functions
 * Handles user CRUD operations and WorkOS synchronization
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get the current authenticated user
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(v.null(), v.any()), // Returns User document or null
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    return user ?? null;
  },
});

/**
 * Get user by ID
 */
export const getById = query({
  args: { userId: v.id("users") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by WorkOS ID
 */
export const getByWorkOSId = query({
  args: { workosId: v.string() },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .unique();
  },
});

/**
 * Get user profile with organization memberships
 */
export const getProfile = query({
  args: {},
  returns: v.union(v.null(), v.object({
    user: v.any(),
    memberships: v.array(v.any()),
  })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    // Get active memberships with org details
    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    const membershipsWithOrgs = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.organizationId);
        return {
          ...m,
          organization: org,
        };
      })
    );

    return {
      user,
      memberships: membershipsWithOrgs,
    };
  },
});

/**
 * Search users (for organization invites)
 */
export const search = query({
  args: { 
    query: v.string(),
    organizationId: v.optional(v.id("organizations")),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const limit = args.limit ?? 10;
    const searchQuery = args.query.toLowerCase();

    // Get all users and filter (for small datasets)
    // For larger datasets, consider using search indexes
    const users = await ctx.db.query("users").collect();
    
    let filtered = users.filter((u) => 
      u.email.toLowerCase().includes(searchQuery) ||
      u.firstName?.toLowerCase().includes(searchQuery) ||
      u.lastName?.toLowerCase().includes(searchQuery)
    );

    // If organization specified, exclude existing members
    if (args.organizationId) {
      const existingMembers = await ctx.db
        .query("organizationMemberships")
        .withIndex("by_organization", (q) => 
          q.eq("organizationId", args.organizationId!)
        )
        .collect();
      
      const memberIds = new Set(existingMembers.map((m) => m.userId));
      filtered = filtered.filter((u) => !memberIds.has(u._id));
    }

    return filtered.slice(0, limit);
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Store or update user from WorkOS authentication
 * Called during sign-in/sign-up
 */
export const store = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args): Promise<Id<"users">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Check if user exists by WorkOS ID
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName ?? existingUser.firstName,
        lastName: args.lastName ?? existingUser.lastName,
        profilePictureUrl: args.profilePictureUrl ?? existingUser.profilePictureUrl,
        lastLoginAt: now,
        updatedAt: now,
      });
      
      // Update session
      await ctx.runMutation(api.sessions.updateLastActive, {
        userId: existingUser._id,
      });

      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      workosId: args.workosId,
      tokenIdentifier: identity.tokenIdentifier,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      profilePictureUrl: args.profilePictureUrl,
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create personal organization for new user
    const personalOrgId = await ctx.runMutation(api.organizations.createPersonal, {
      userId,
      userName: `${args.firstName ?? ""} ${args.lastName ?? ""}`.trim() || args.email,
    });

    // Add user as owner of their personal org
    await ctx.db.insert("organizationMemberships", {
      userId,
      organizationId: personalOrgId,
      role: "owner",
      isActive: true,
      joinedAt: now,
      lastAccessedAt: now,
    });

    // Create session
    await ctx.runMutation(api.sessions.create, {
      userId,
    });

    // Log user creation
    await ctx.runMutation(api.auditLogs.create, {
      userId,
      action: "user.created",
      resource: "user",
      resourceId: userId,
      metadata: {
        email: args.email,
        method: "workos",
      },
    });

    return userId;
  },
});

/**
 * Update user profile
 */
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
      notifications: v.optional(v.boolean()),
      language: v.optional(v.string()),
    })),
  },
  returns: v.id("users"),
  handler: async (ctx, args): Promise<Id<"users">> => {
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

    const updateData: Partial<Doc<"users">> = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) updateData.firstName = args.firstName;
    if (args.lastName !== undefined) updateData.lastName = args.lastName;
    if (args.profilePictureUrl !== undefined) updateData.profilePictureUrl = args.profilePictureUrl;
    if (args.preferences !== undefined) {
      updateData.preferences = {
        ...user.preferences,
        ...args.preferences,
      };
    }

    await ctx.db.patch(user._id, updateData);

    // Log profile update
    await ctx.runMutation(api.auditLogs.create, {
      userId: user._id,
      action: "user.profile_updated",
      resource: "user",
      resourceId: user._id,
    });

    return user._id;
  },
});

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        lastLoginAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Deactivate user account (soft delete)
 */
export const deactivate = mutation({
  args: {},
  handler: async (ctx) => {
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

    const now = Date.now();

    // Deactivate user
    await ctx.db.patch(user._id, {
      isActive: false,
      updatedAt: now,
    });

    // Deactivate all memberships
    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const membership of memberships) {
      await ctx.db.patch(membership._id, {
        isActive: false,
        lastAccessedAt: now,
      });
    }

    // End all sessions
    await ctx.runMutation(api.sessions.endAllUserSessions, {
      userId: user._id,
    });

    // Log deactivation
    await ctx.runMutation(api.auditLogs.create, {
      userId: user._id,
      action: "user.deactivated",
      resource: "user",
      resourceId: user._id,
    });
  },
});

// ============================================================================
// Internal Mutations
// ============================================================================

/**
 * Internal: Update user from WorkOS webhook
 */
export const internalUpdateFromWorkOS = internalMutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        email: args.email,
        firstName: args.firstName ?? user.firstName,
        lastName: args.lastName ?? user.lastName,
        profilePictureUrl: args.profilePictureUrl ?? user.profilePictureUrl,
        updatedAt: Date.now(),
      });
    }
  },
});
