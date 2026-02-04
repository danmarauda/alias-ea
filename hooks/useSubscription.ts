import { useCallback } from 'react';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

/**
 * Hook for checking subscription status and gating features
 * NOTE: This is a stub implementation without RevenueCat
 * All users are treated as having 'free' tier
 */
export const useSubscription = () => {
  // Stub values - all users are free tier without RevenueCat
  const isActiveSubscriber = false;
  const subscriptionTier: SubscriptionTier = 'free';
  const loading = false;
  const error = null;

  /**
   * Check if user has access to a specific feature tier
   */
  const hasAccess = useCallback(
    (requiredTier: SubscriptionTier = 'free'): boolean => {
      if (loading) return false;

      const tierLevels: Record<SubscriptionTier, number> = {
        free: 0,
        starter: 1,
        pro: 2,
        enterprise: 3,
      };

      return tierLevels[subscriptionTier] >= tierLevels[requiredTier];
    },
    [subscriptionTier, loading]
  );

  /**
   * Check if user has access to a specific feature by entitlement
   * (stub - always returns false for non-free tiers)
   */
  const hasEntitlement = useCallback(
    (_entitlementId: string): boolean => {
      return false;
    },
    []
  );

  /**
   * Feature access helpers
   */
  const canUseVoiceAgent = hasAccess('starter');
  const canUseAdvancedAI = hasAccess('pro');
  const canUseAPI = hasAccess('pro');
  const canUseCustomIntegrations = hasAccess('enterprise');
  const hasUnlimitedMessages = hasAccess('starter');

  return {
    // Subscription status
    isActiveSubscriber,
    subscriptionTier,
    isLoading: loading,
    error,

    // Access control
    hasAccess,
    hasEntitlement,

    // Feature flags
    canUseVoiceAgent,
    canUseAdvancedAI,
    canUseAPI,
    canUseCustomIntegrations,
    hasUnlimitedMessages,
  };
};

export default useSubscription;
