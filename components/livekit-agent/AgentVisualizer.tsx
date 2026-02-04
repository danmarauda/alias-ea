/**
 * Agent Visualizer Component
 * Animated visualization of agent state with audio waves
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Icon from '@/components/Icon';

type AgentState = 'disconnected' | 'connecting' | 'initializing' | 'listening' | 'thinking' | 'speaking' | 'idle';

interface AgentVisualizerProps {
  agentState: AgentState;
  isSpeaking: boolean;
  isListening: boolean;
  agentName?: string;
}

export default function AgentVisualizer({
  agentState,
  isSpeaking,
  isListening,
  agentName = 'AI Agent',
}: AgentVisualizerProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Animation based on state
  useEffect(() => {
    if (isSpeaking) {
      // Pulsing animation for speaking
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 400, easing: Easing.ease }),
          withTiming(1, { duration: 400, easing: Easing.ease })
        ),
        -1,
        false
      );
    } else if (isListening) {
      // Subtle pulse for listening
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.ease }),
          withTiming(1, { duration: 800, easing: Easing.ease })
        ),
        -1,
        false
      );
    } else if (agentState === 'thinking') {
      // Rotation for thinking
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      // Reset animations
      scale.value = withTiming(1, { duration: 300 });
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isSpeaking, isListening, agentState]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const getStateColor = () => {
    switch (agentState) {
      case 'listening':
        return '#10B981';
      case 'thinking':
        return '#F59E0B';
      case 'speaking':
        return '#3B82F6';
      case 'idle':
        return '#6B7280';
      case 'initializing':
        return '#F59E0B';
      case 'connecting':
        return '#9CA3AF';
      default:
        return '#EF4444';
    }
  };

  const getStateIcon = () => {
    switch (agentState) {
      case 'listening':
        return 'Mic' as const;
      case 'thinking':
        return 'Brain' as const;
      case 'speaking':
        return 'Volume2' as const;
      case 'idle':
        return 'CheckCircle' as const;
      case 'initializing':
      case 'connecting':
        return 'Loader' as const;
      default:
        return 'AlertCircle' as const;
    }
  };

  const stateColor = getStateColor();

  return (
    <View style={styles.container}>
      {/* Main avatar circle */}
      <Animated.View
        style={[
          styles.avatar,
          { backgroundColor: stateColor },
          animatedStyle,
        ]}
      >
        <Icon name={getStateIcon()} size={48} color="#FFFFFF" />
      </Animated.View>

      {/* Outer ring */}
      {(isSpeaking || isListening) && (
        <View style={[styles.ring, { borderColor: stateColor }]} />
      )}

      {/* Agent name */}
      <Text style={styles.agentName}>{agentName}</Text>

      {/* Audio wave visualization */}
      {isSpeaking && <AudioWaves color={stateColor} />}
    </View>
  );
}

/**
 * Audio Waves Component
 */
function AudioWaves({ color }: { color: string }) {
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.5);
  const bar3 = useSharedValue(0.7);
  const bar4 = useSharedValue(0.5);
  const bar5 = useSharedValue(0.3);

  useEffect(() => {
    const animate = (value: any, delay: number) => {
      value.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 200 + delay, easing: Easing.ease }),
          withTiming(0.9, { duration: 300 + delay, easing: Easing.ease }),
          withTiming(0.4, { duration: 200 + delay, easing: Easing.ease })
        ),
        -1,
        false
      );
    };

    animate(bar1, 0);
    animate(bar2, 50);
    animate(bar3, 100);
    animate(bar4, 50);
    animate(bar5, 0);
  }, []);

  const createBarStyle = (value: any) =>
    useAnimatedStyle(() => ({
      height: value.value * 60,
    }));

  return (
    <View style={styles.waveContainer}>
      <Animated.View style={[styles.bar, { backgroundColor: color }, createBarStyle(bar1)]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, createBarStyle(bar2)]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, createBarStyle(bar3)]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, createBarStyle(bar4)]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, createBarStyle(bar5)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    opacity: 0.3,
  },
  agentName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 24,
    height: 60,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
});
