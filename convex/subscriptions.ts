import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// Queries
// ============================================================================

/**
 * Get current user's subscription
 */
export const getUserSubscription = query({
  args: {},
  returns: v.union(v.null(), v.any()),
  handler: async (ctx): Promise<Doc<"subscriptions"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .first();

    return subscription ?? null;
  },
});

/**
 * Get user's payment history
 */
export const getPaymentHistory = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args): Promise<Doc<"paymentHistory">[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const payments = await ctx.db
      .query("paymentHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 20);

    return payments;
  },
});

/**
 * Check if user has specific entitlement
 */
export const checkEntitlement = query({
  args: {
    tier: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise")
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

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .first();

    if (!subscription) return args.tier === "free";

    const tierLevels: Record<string, number> = {
      free: 0,
      starter: 1,
      pro: 2,
      enterprise: 3,
    };

    return tierLevels[subscription.tier] >= tierLevels[args.tier];
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create or update subscription from Stripe webhook
 */
export const upsertSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
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
    period: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),
    currency: v.optional(v.string()),
    price: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find user by Stripe customer ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();

    if (!user) {
      throw new Error("User not found for Stripe customer ID");
    }

    const now = Date.now();

    // Check for existing subscription
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, {
        tier: args.tier,
        status: args.status,
        period: args.period,
        currency: args.currency,
        price: args.price,
        expiresAt: args.expiresAt,
        trialEndsAt: args.trialEndsAt,
        updatedAt: now,
      });

      // Update user tier
      await ctx.db.patch(user._id, {
        subscriptionTier: args.tier,
        updatedAt: now,
      });

      return existingSubscription._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: user._id,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      tier: args.tier,
      status: args.status,
      period: args.period,
      currency: args.currency,
      price: args.price,
      startedAt: now,
      expiresAt: args.expiresAt,
      trialEndsAt: args.trialEndsAt,
      updatedAt: now,
    });

    // Update user tier
    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier,
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

/**
 * Link Stripe customer ID to user
 */
export const linkStripeCustomer = mutation({
  args: {
    stripeCustomerId: v.string(),
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

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Cancel subscription
 */
export const cancelSubscription = mutation({
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

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .first();

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    const now = Date.now();

    // Update subscription status
    await ctx.db.patch(subscription._id, {
      status: "cancelled",
      cancelledAt: now,
      updatedAt: now,
    });

    // Update user tier to free
    await ctx.db.patch(user._id, {
      subscriptionTier: "free",
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Record payment event (for history)
 */
export const recordPayment = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    providerTransactionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    description: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Find active subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .first();

    await ctx.db.insert("paymentHistory", {
      userId: user._id,
      subscriptionId: subscription?._id,
      provider: "stripe",
      providerTransactionId: args.providerTransactionId,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      description: args.description,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
