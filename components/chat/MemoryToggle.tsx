/**
 * Memory Toggle Component
 * Incognito mode toggle to disable chat history saving
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import Icon from '@/components/Icon';

interface MemoryToggleProps {
  isIncognito: boolean;
  onToggle: (value: boolean) => void;
}

export default function MemoryToggle({ isIncognito, onToggle }: MemoryToggleProps) {
  return (
    <Pressable 
      style={styles.container}
      onPress={() => onToggle(!isIncognito)}
    >
      <View style={styles.iconContainer}>
        <Icon 
          name={isIncognito ? 'EyeOff' : 'Eye'} 
          size={20} 
          color={isIncognito ? '#F59E0B' : '#10B981'} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>
          {isIncognito ? 'Incognito Mode' : 'Memory Enabled'}
        </Text>
        <Text style={styles.description}>
          {isIncognito 
            ? 'Chat history will not be saved' 
            : 'Conversations are saved for future reference'}
        </Text>
      </View>

      <Switch
        value={isIncognito}
        onValueChange={onToggle}
        trackColor={{ false: '#3D3D3D', true: 'rgba(245, 158, 11, 0.3)' }}
        thumbColor={isIncognito ? '#F59E0B' : '#FFFFFF'}
      />
    </Pressable>
  );
}

export function MemoryToggleCompact({ isIncognito, onToggle }: MemoryToggleProps) {
  return (
    <Pressable 
      style={styles.compactContainer}
      onPress={() => onToggle(!isIncognito)}
    >
      <Icon 
        name={isIncognito ? 'EyeOff' : 'Eye'} 
        size={18} 
        color={isIncognito ? '#F59E0B' : '#9CA3AF'} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  compactContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
