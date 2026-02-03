import React, { useState } from 'react';
import { View, Pressable, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/contexts/AuthContext';
import ThemedText from '@/components/ThemedText';
import Icon from '@/components/Icon';
import useThemeColors from '@/contexts/ThemeColors';
import { Id } from '@/convex/_generated/dataModel';

interface OrganizationSwitcherProps {
  currentOrganizationId?: Id<'organizations'>;
  onSelect?: (orgId: Id<'organizations'>) => void;
}

export function OrganizationSwitcher({ currentOrganizationId, onSelect }: OrganizationSwitcherProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { workOSOrganization } = useAuth();
  const { organizations, isLoading } = useOrganizations();
  const [isOpen, setIsOpen] = useState(false);

  const currentOrg = organizations.find(
    (o) => o.organization._id === currentOrganizationId
  );

  if (isLoading) {
    return (
      <View className="px-4 py-3">
        <ThemedText className="text-subtext">Loading...</ThemedText>
      </View>
    );
  }

  if (organizations.length === 0) {
    return (
      <View className="px-4 py-3">
        <ThemedText className="text-subtext">No organizations</ThemedText>
      </View>
    );
  }

  const handleSelect = (orgId: Id<'organizations'>) => {
    setIsOpen(false);
    onSelect?.(orgId);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center px-4 py-3 bg-surface rounded-lg mx-4"
      >
        <View className="w-8 h-8 rounded-full bg-highlight/20 items-center justify-center mr-3">
          <ThemedText className="font-outfit-bold text-highlight">
            {currentOrg?.organization.name?.[0] ?? workOSOrganization?.name?.[0] ?? '?'}
          </ThemedText>
        </View>
        <View className="flex-1">
          <ThemedText className="font-medium">
            {currentOrg?.organization.name ?? workOSOrganization?.name ?? 'Personal'}
          </ThemedText>
          <ThemedText className="text-xs text-subtext">
            {currentOrg?.membership.role ?? 'Owner'}
          </ThemedText>
        </View>
        <Icon name="ChevronDown" size={20} color={colors.text} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center px-6"
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-background rounded-xl overflow-hidden max-h-96">
            <View className="px-4 py-3 border-b border-border">
              <ThemedText className="font-outfit-bold text-lg">Organizations</ThemedText>
            </View>
            
            <FlatList
              data={organizations}
              keyExtractor={(item) => item.organization._id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item.organization._id)}
                  className={`flex-row items-center px-4 py-3 ${
                    item.organization._id === currentOrganizationId ? 'bg-highlight/10' : ''
                  }`}
                >
                  <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-3">
                    <ThemedText className="font-outfit-bold">
                      {item.organization.name[0]}
                    </ThemedText>
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-medium">
                      {item.organization.name}
                    </ThemedText>
                    <ThemedText className="text-xs text-subtext">
                      {item.membership.role}
                    </ThemedText>
                  </View>
                  {item.organization._id === currentOrganizationId && (
                    <Icon name="Check" size={20} color={colors.highlight} />
                  )}
                </Pressable>
              )}
            />

            <Pressable
              onPress={() => {
                setIsOpen(false);
                router.push('/screens/organization/new');
              }}
              className="flex-row items-center px-4 py-3 border-t border-border"
            >
              <View className="w-8 h-8 rounded-full bg-highlight/20 items-center justify-center mr-3">
                <Icon name="Plus" size={16} color={colors.highlight} />
              </View>
              <ThemedText className="text-highlight">Create Organization</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
