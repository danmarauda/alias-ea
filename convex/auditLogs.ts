import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Audit Log Functions
 * Tracks all important actions for security and compliance
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get audit logs for an organization
 */
export const getForOrganization = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    logs: v.array(v.any()),
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { logs: [] };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return { logs: [] };
    }

    // Check permissions (admin or owner)
    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      return { logs: [] };
    }

    if (!["owner", "admin"].includes(membership.role)) {
      return { logs: [] };
    }

    const limit = args.limit ?? 50;

    let logs;
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as Id<"auditLogs">);
      if (!cursorDoc) {
        return { logs: [] };
      }
      
      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_organization_and_time", (q) => 
          q.eq("organizationId", args.organizationId)
        )
        .filter((q) => q.lt("_creationTime", cursorDoc._creationTime))
        .order("desc")
        .take(limit);
    } else {
      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(limit);
    }

    // Enrich logs with user info
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => ({
        ...log,
        user: log.userId ? await ctx.db.get(log.userId) : null,
      }))
    );

    const nextCursor = logs.length === limit 
      ? logs[logs.length - 1]._id 
      : undefined;

    return {
      logs: enrichedLogs,
      nextCursor,
    };
  },
});

/**
 * Get audit logs for current user
 */
export const getForCurrentUser = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    logs: v.array(v.any()),
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { logs: [] };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return { logs: [] };
    }

    const limit = args.limit ?? 50;

    let logs;
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as Id<"auditLogs">);
      if (!cursorDoc) {
        return { logs: [] };
      }

      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.lt("_creationTime", cursorDoc._creationTime))
        .order("desc")
        .take(limit);
    } else {
      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(limit);
    }

    const nextCursor = logs.length === limit 
      ? logs[logs.length - 1]._id 
      : undefined;

    return {
      logs,
      nextCursor,
    };
  },
});

/**
 * Get recent activity summary for organization
 */
export const getActivitySummary = query({
  args: { organizationId: v.id("organizations") },
  returns: v.object({
    totalActions: v.number(),
    recentActions: v.array(v.any()),
    actionCounts: v.any(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { totalActions: 0, recentActions: [], actionCounts: {} };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return { totalActions: 0, recentActions: [], actionCounts: {} };
    }

    // Check membership
    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      return { totalActions: 0, recentActions: [], actionCounts: {} };
    }

    // Get last 24 hours of activity
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_organization_and_time", (q) => 
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.gte("createdAt", oneDayAgo))
      .collect();

    // Count actions by type
    const actionCounts: Record<string, number> = {};
    logs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    // Get recent actions (last 10)
    const recentActions = logs
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    const enrichedRecent = await Promise.all(
      recentActions.map(async (log) => ({
        ...log,
        user: log.userId ? await ctx.db.get(log.userId) : null,
      }))
    );

    return {
      totalActions: logs.length,
      recentActions: enrichedRecent,
      actionCounts,
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create an audit log entry
 */
export const create = mutation({
  args: {
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    await ctx.db.insert("auditLogs", {
      organizationId: args.organizationId,
      userId: user?._id,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

// ============================================================================
// Internal Mutations
// ============================================================================

/**
 * Internal: Create audit log (for use by other internal mutations)
 */
export const internalCreate = internalMutation({
  args: {
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      organizationId: args.organizationId,
      userId: args.userId,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

/**
 * Cleanup old audit logs (run periodically)
 */
export const cleanupOld = internalMutation({
  args: {
    olderThanDays: v.number(), // Delete logs older than X days
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000;

    const oldLogs = await ctx.db
      .query("auditLogs")
      .filter((q) => q.lt("createdAt", cutoff))
      .collect();

    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    return { deleted: oldLogs.length };
  },
});
