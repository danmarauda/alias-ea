import React, { useState } from 'react';
import { View, Modal, Pressable, Alert } from 'react-native';
import { useOrganizationMembers } from '@/hooks/useOrganizations';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import useThemeColors from '@/contexts/ThemeColors';
import { Id } from '@/convex/_generated/dataModel';

interface InviteModalProps {
  organizationId: Id<'organizations'>;
  isVisible: boolean;
  onClose: () => void;
}

type Role = 'admin' | 'member' | 'viewer';

const roles: { value: Role; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Can manage members and settings' },
  { value: 'member', label: 'Member', description: 'Can access all features' },
  { value: 'viewer', label: 'Viewer', description: 'View-only access' },
];

export function InviteModal({ organizationId, isVisible, onClose }: InviteModalProps) {
  const colors = useThemeColors();
  const { inviteMember } = useOrganizationMembers(organizationId);
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteMember({
        organizationId,
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        role: selectedRole,
      });
      
      Alert.alert('Success', `Invitation sent to ${email}`);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setSelectedRole('member');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <ThemedText className="font-outfit-bold text-xl">Invite Member</ThemedText>
            <Pressable onPress={handleClose} className="p-2">
              <Icon name="X" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Form */}
          <View className="p-6 space-y-4">
            <Input
              label="Email"
              placeholder="colleague@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label="First Name (optional)"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Last Name (optional)"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Role Selection */}
            <View>
              <ThemedText className="text-sm font-medium mb-3">Role</ThemedText>
              {roles.map((role) => (
                <Pressable
                  key={role.value}
                  onPress={() => setSelectedRole(role.value)}
                  className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                    selectedRole === role.value
                      ? 'border-highlight bg-highlight/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    selectedRole === role.value ? 'border-highlight' : 'border-subtext'
                  }`}>
                    {selectedRole === role.value && (
                      <View className="w-2.5 h-2.5 rounded-full bg-highlight" />
                    )}
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-medium">{role.label}</ThemedText>
                    <ThemedText className="text-xs text-subtext">
                      {role.description}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Submit Button */}
            <Button
              title="Send Invitation"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              size="large"
              rounded="full"
              className="mt-4"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
