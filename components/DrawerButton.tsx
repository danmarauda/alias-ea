import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { useDrawer } from '@/app/contexts/DrawerContext';
import Icon from './Icon';
import { useThemeColors } from 'app/contexts/ThemeColors';
import Avatar from './Avatar';
interface DrawerButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: ViewStyle;
  isAvatar?: boolean;
}

export default function DrawerButton({ size = 'md', className, style, isAvatar = false }: DrawerButtonProps) {
  const { openDrawer } = useDrawer();
  const colors = useThemeColors();

  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <View className={`rounded-full ${className}`} style={style}>
      <Pressable
        onPress={openDrawer}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {isAvatar ? (
          <Avatar src="https://mighty.tools/mockmind-api/content/human/5.jpg" size="xs" />
        ) : (
          <Icon name="Menu" size={sizeMap[size]} color={colors.text} />
        )}
      </Pressable>
    </View>
  );
} 