import React from 'react';
import { View, FlatList, Pressable, Alert } from 'react-native';
import { useOrganizationMembers, useOrganization } from '@/hooks/useOrganizations';
import ThemedText from '@/components/ThemedText';
import Icon from '@/components/Icon';
import Button from '@/components/Button';
import useThemeColors from '@/contexts/ThemeColors';
import { Id } from '@/convex/_generated/dataModel';

interface MemberListProps {
  organizationId: Id<'organizations'>;
}

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

export function MemberList({ organizationId }: MemberListProps) {
  const colors = useThemeColors();
  const { members, isLoading, removeMember, updateRole } = useOrganizationMembers(organizationId);
  const { currentMembership, isAdmin, isOwner } = useOrganization(organizationId);

  if (isLoading) {
    return (
      <View className="p-4">
        <ThemedText className="text-subtext">Loading members...</ThemedText>
      </View>
    );
  }

  const handleRemoveMember = (userId: Id<'users'>, name: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${name} from this organization?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeMember({ organizationId, userId }),
        },
      ]
    );
  };

  const handleUpdateRole = (userId: Id<'users'>, currentRole: string) => {
    const options = isOwner 
      ? ['admin', 'member', 'viewer'] 
      : ['member', 'viewer'];
    
    Alert.alert(
      'Change Role',
      'Select a new role',
      [
        ...options.map((role) => ({
          text: roleLabels[role],
          onPress: () => updateRole({ organizationId, userId, role: role as any }),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMember = ({ item }: { item: typeof members[0] }) => {
    const isCurrentUser = item.userId === currentMembership?.userId;
    const canManage = isAdmin && item.role !== 'owner' && !isCurrentUser;

    return (
      <View className="flex-row items-center p-4 border-b border-border">
        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3">
          {item.user?.profilePictureUrl ? (
            <Image
              source={{ uri: item.user.profilePictureUrl }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <ThemedText className="font-outfit-bold text-lg">
              {item.user?.firstName?.[0] ?? item.user?.email[0]}
            </ThemedText>
          )}
        </View>
        
        <View className="flex-1">
          <ThemedText className="font-medium">
            {item.user?.firstName 
              ? `${item.user.firstName} ${item.user.lastName ?? ''}`
              : item.user?.email}
          </ThemedText>
          <ThemedText className="text-xs text-subtext">
            {item.user?.email}
          </ThemedText>
        </View>

        <View className="flex-row items-center">
          <Pressable
            onPress={() => canManage && handleUpdateRole(item.userId, item.role)}
            disabled={!canManage}
            className={`px-3 py-1 rounded-full mr-2 ${
              item.role === 'owner' 
                ? 'bg-yellow-500/20' 
                : item.role === 'admin'
                ? 'bg-highlight/20'
                : 'bg-surface'
            }`}
          >
            <ThemedText className={`text-xs ${
              item.role === 'owner' || item.role === 'admin' 
                ? 'text-highlight' 
                : 'text-subtext'
            }`}>
              {roleLabels[item.role]}
            </ThemedText>
          </Pressable>

          {canManage && (
            <Pressable
              onPress={() => handleRemoveMember(item.userId, item.user?.email ?? 'this member')}
              className="p-2"
            >
              <Icon name="X" size={18} color={colors.error} />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <ThemedText className="font-outfit-bold text-lg">
          Members ({members.length})
        </ThemedText>
        {isAdmin && (
          <Button
            title="Invite"
            variant="ghost"
            size="small"
            onPress={() => {/* Open invite modal */}}
          />
        )}
      </View>
      
      <FlatList
        data={members}
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        ListEmptyComponent={
          <View className="p-8 items-center">
            <ThemedText className="text-subtext">No members found</ThemedText>
          </View>
        }
      />
    </View>
  );
}
