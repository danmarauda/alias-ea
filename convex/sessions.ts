import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Session Management Functions
 * Tracks user sessions for security and device management
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get active sessions for current user
 */
export const getActiveForCurrentUser = query({
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

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    return sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  },
});

/**
 * Get session by ID
 */
export const getById = query({
  args: { sessionId: v.id("sessions") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args): Promise<Doc<"sessions"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    const session = await ctx.db.get(args.sessionId);
    
    // Only return if belongs to current user
    if (session && session.userId === user._id) {
      return session;
    }

    return null;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new session
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    deviceType: v.optional(v.string()),
    deviceName: v.optional(v.string()),
    workosSessionId: v.optional(v.string()),
  },
  returns: v.id("sessions"),
  handler: async (ctx, args): Promise<Id<"sessions">> => {
    const now = Date.now();

    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      workosSessionId: args.workosSessionId,
      deviceType: args.deviceType ?? "unknown",
      deviceName: args.deviceName ?? "Unknown Device",
      isActive: true,
      startedAt: now,
      lastActiveAt: now,
    });

    return sessionId;
  },
});

/**
 * Update last active timestamp
 */
export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Find the most recent active session for this user
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();

    const mostRecent = sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt)[0];

    if (mostRecent) {
      await ctx.db.patch(mostRecent._id, {
        lastActiveAt: Date.now(),
      });
    }
  },
});

/**
 * End a specific session
 */
export const endSession = mutation({
  args: { sessionId: v.id("sessions") },
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

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Can only end own sessions
    if (session.userId !== user._id) {
      throw new Error("Cannot end another user's session");
    }

    await ctx.db.patch(session._id, {
      isActive: false,
      endedAt: Date.now(),
    });

    // Log session end
    await ctx.runMutation(api.auditLogs.create, {
      userId: user._id,
      action: "session.ended",
      resource: "session",
      resourceId: session._id,
    });
  },
});

/**
 * End all sessions except current (logout from all devices)
 */
export const endAllOtherSessions = mutation({
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

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    const now = Date.now();

    // End all active sessions
    for (const session of sessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        endedAt: now,
      });
    }

    // Log action
    await ctx.runMutation(api.auditLogs.create, {
      userId: user._id,
      action: "session.all_ended",
      resource: "session",
      metadata: {
        count: sessions.length,
      },
    });
  },
});

// ============================================================================
// Internal Mutations
// ============================================================================

/**
 * End all sessions for a user (used during logout/deactivation)
 */
export const endAllUserSessions = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();

    const now = Date.now();

    for (const session of sessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        endedAt: now,
      });
    }
  },
});
