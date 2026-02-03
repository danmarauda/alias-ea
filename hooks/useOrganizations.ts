import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Hook for managing organizations
 * Provides CRUD operations and member management
 */
export function useOrganizations() {
  const { user } = useAuth();
  
  // Queries
  const organizations = useQuery(api.organizations.listForCurrentUser);
  
  // Mutations
  const createOrganization = useMutation(api.organizations.create);
  const updateOrganization = useMutation(api.organizations.update);
  const deleteOrganization = useMutation(api.organizations.remove);
  const transferOwnership = useMutation(api.organizations.transferOwnership);
  
  return {
    organizations: organizations ?? [],
    isLoading: organizations === undefined,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    transferOwnership,
  };
}

/**
 * Hook for a single organization with details
 */
export function useOrganization(organizationId: Id<'organizations'> | null) {
  const orgWithMembers = useQuery(
    api.organizations.getWithMembers,
    organizationId ? { organizationId } : 'skip'
  );
  
  const pendingInvitations = useQuery(
    api.organizations.getPendingInvitations,
    organizationId ? { organizationId } : 'skip'
  );
  
  const currentMembership = useQuery(
    api.memberships.getCurrentUserMembership,
    organizationId ? { organizationId } : 'skip'
  );
  
  const updateOrganization = useMutation(api.organizations.update);
  const deleteOrganization = useMutation(api.organizations.remove);
  const transferOwnership = useMutation(api.organizations.transferOwnership);
  
  return {
    organization: orgWithMembers?.organization ?? null,
    members: orgWithMembers?.members ?? [],
    settings: orgWithMembers?.settings ?? null,
    pendingInvitations: pendingInvitations ?? [],
    currentMembership: currentMembership ?? null,
    isLoading: orgWithMembers === undefined,
    isAdmin: currentMembership?.role === 'admin' || currentMembership?.role === 'owner',
    isOwner: currentMembership?.role === 'owner',
    updateOrganization,
    deleteOrganization,
    transferOwnership,
  };
}

/**
 * Hook for organization members
 */
export function useOrganizationMembers(organizationId: Id<'organizations'> | null) {
  const members = useQuery(
    api.memberships.getOrganizationMembers,
    organizationId ? { organizationId } : 'skip'
  );
  
  const inviteMember = useMutation(api.memberships.inviteMember);
  const updateRole = useMutation(api.memberships.updateRole);
  const removeMember = useMutation(api.memberships.removeMember);
  const cancelInvitation = useMutation(api.memberships.cancelInvitation);
  
  return {
    members: members ?? [],
    isLoading: members === undefined,
    inviteMember,
    updateRole,
    removeMember,
    cancelInvitation,
  };
}

/**
 * Hook for invitations
 */
export function useInvitations() {
  const pendingInvitations = useQuery(api.invitations.getPendingForCurrentUser);
  
  const acceptInvitation = useMutation(api.memberships.acceptInvitation);
  const declineInvitation = useMutation(api.memberships.declineInvitation);
  const resendInvitation = useMutation(api.invitations.resend);
  
  return {
    pendingInvitations: pendingInvitations ?? [],
    isLoading: pendingInvitations === undefined,
    acceptInvitation,
    declineInvitation,
    resendInvitation,
    hasPending: (pendingInvitations ?? []).length > 0,
  };
}

/**
 * Hook for checking permissions
 */
export function useOrganizationPermission(
  organizationId: Id<'organizations'> | null,
  requiredRole: 'owner' | 'admin' | 'member' | 'viewer'
) {
  const hasPermission = useQuery(
    api.memberships.checkPermission,
    organizationId ? { organizationId, requiredRole } : 'skip'
  );
  
  return {
    hasPermission: hasPermission ?? false,
    isLoading: hasPermission === undefined,
  };
}

/**
 * Hook for audit logs
 */
export function useAuditLogs(organizationId: Id<'organizations'> | null) {
  const logs = useQuery(
    api.auditLogs.getForOrganization,
    organizationId ? { organizationId, limit: 50 } : 'skip'
  );
  
  const activitySummary = useQuery(
    api.auditLogs.getActivitySummary,
    organizationId ? { organizationId } : 'skip'
  );
  
  return {
    logs: logs?.logs ?? [],
    nextCursor: logs?.nextCursor,
    activitySummary: activitySummary ?? { totalActions: 0, recentActions: [], actionCounts: {} },
    isLoading: logs === undefined,
  };
}

/**
 * Hook for sessions
 */
export function useSessions() {
  const sessions = useQuery(api.sessions.getActiveForCurrentUser);
  
  const endSession = useMutation(api.sessions.endSession);
  const endAllOtherSessions = useMutation(api.sessions.endAllOtherSessions);
  
  return {
    sessions: sessions ?? [],
    isLoading: sessions === undefined,
    endSession,
    endAllOtherSessions,
  };
}
