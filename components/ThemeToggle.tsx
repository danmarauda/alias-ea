import React, { useState, useRef } from 'react';
import { View, Pressable, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from 'app/contexts/ThemeContext';
import Icon from './Icon';
import useThemeColors from '@/app/contexts/ThemeColors';

interface ThemeToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const slideAnim = useRef(new Animated.Value(value !== undefined ? (value ? 6 : 6) : (isDark ? 6 : 6))).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePress = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const newValue = value !== undefined ? !value : !isDark;
    
    if (onChange) {
      onChange(newValue);
    } else {
      toggleTheme();
    }
    
    // Animate the switch
    Animated.spring(slideAnim, {
      toValue: newValue ? 6 : 0.5,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12
    }).start(() => setIsAnimating(false));
  };

  const isActive = value !== undefined ? value : isDark;

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={handlePress}
      className={`flex-row items-center py-1 ${className}`}
    >
      <View className="w-20 h-10 rounded-full flex-row items-center justify-between">
        <View className="absolute w-full h-full rounded-full bg-light-secondary dark:bg-dark-secondary" />
        
        {/* Sun icon on left */}
        <View className="z-10 w-8 h-8 items-center justify-center ml-1">
          <Icon name="Sun" size={16} color={isActive ? colors.icon : colors.text} />
        </View>
        
        {/* Moon icon on right */}
        <View className="z-10 w-8 h-8 items-center justify-center mr-1">
          <Icon name="Moon" size={16} color={!isActive ? colors.icon : colors.text} />
        </View>
        
        {/* Animated thumb */}
        <Animated.View
          style={{
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 7]
              })
            }],
            position: 'absolute',
            left: 1,
          }}
          className="w-8 h-8 bg-white dark:bg-dark-primary rounded-full shadow-sm my-0.5"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ThemeToggle;
