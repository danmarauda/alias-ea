import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { shadowPresets } from '@/utils/useShadow';
import useThemeColors from '@/app/contexts/ThemeColors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  shadowSize?: 'small' | 'medium' | 'large' | 'none';
  className?: string;
}

/**
 * Card component with consistent shadow styling
 */
const Card = ({ 
  children, 
  onPress, 
  style, 
  shadowSize = 'medium',
  className = ''
}: CardProps) => {
  const colors = useThemeColors();
  
  // Get shadow style based on size
  const getShadowStyle = (): ViewStyle => {
    if (shadowSize === 'none') return {};
    if (shadowSize === 'small') return shadowPresets.small;
    if (shadowSize === 'large') return shadowPresets.large;
    return shadowPresets.medium;
  };

  const cardStyle = {
    backgroundColor: colors.bg,
    ...getShadowStyle(),
    ...style
  };

  // If onPress is provided, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={cardStyle}
        className={`rounded-lg overflow-hidden ${className}`}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise, render as a simple View
  return (
    <View style={cardStyle} className={`rounded-lg overflow-hidden ${className}`}>
      {children}
    </View>
  );
};

export default Card; 