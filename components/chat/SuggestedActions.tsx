/**
 * Suggested Actions Component
 * Displays suggested conversation starters that fade out when user starts typing
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from '@/components/Icon';

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  action: string;
  icon?: string;
}

interface SuggestedActionsProps {
  hasInput?: boolean;
  hasAttachments?: boolean;
  onActionPress: (action: string) => void;
  actions?: SuggestedAction[];
}

const DEFAULT_ACTIONS: SuggestedAction[] = [
  {
    id: '1',
    title: "Analyze LiveKit features",
    description: "Get recommendations on which LiveKit features to implement for your voice AI app",
    action: "What LiveKit features should I implement for my voice AI application?",
    icon: 'Mic',
  },
  {
    id: '2',
    title: "Build an AI agent",
    description: "Step-by-step guide to creating a conversational AI agent with speech capabilities",
    action: "Help me create a voice AI agent with STT, LLM, and TTS capabilities",
    icon: 'Bot',
  },
  {
    id: '3',
    title: "Debug React Native issue",
    description: "Get help troubleshooting common React Native development problems",
    action: "Help me debug a React Native issue with LiveKit integration",
    icon: 'Bug',
  },
  {
    id: '4',
    title: "Optimize performance",
    description: "Learn techniques to improve app performance and reduce latency",
    action: "How can I optimize the performance of my React Native AI app?",
    icon: 'Zap',
  },
];

export default function SuggestedActions({
  hasInput = false,
  hasAttachments = false,
  onActionPress,
  actions = DEFAULT_ACTIONS,
}: SuggestedActionsProps) {
  const { width } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(0);
  
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const shouldHide = hasInput || hasAttachments;
    opacity.value = withTiming(shouldHide ? 0 : 1, { duration: 200 });
    scale.value = withTiming(shouldHide ? 0.95 : 1, { duration: 200 });
  }, [hasInput, hasAttachments]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePress = (action: string) => {
    onActionPress(action);
  };

  // Don't render if completely hidden
  if (hasInput || hasAttachments) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.header}>
        <Icon name="Lightbulb" size={20} color="#F59E0B" />
        <Text style={styles.headerText}>Suggested actions</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
      >
        {actions.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item.action)}
            style={({ pressed }) => [
              styles.actionCard,
              { width: Math.min(280, width - 64) },
              pressed && styles.actionCardPressed,
              index === actions.length - 1 && { marginRight: 16 },
            ]}
            onLayout={(e) => {
              if (index === 0) {
                setCardWidth(e.nativeEvent.layout.width);
              }
            }}
          >
            <View style={styles.cardContent}>
              {item.icon && (
                <View style={styles.iconContainer}>
                  <Icon name={item.icon as any} size={24} color="#3B82F6" />
                </View>
              )}
              <View style={styles.textContainer}>
                <Text style={styles.actionTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.actionDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    overflow: 'hidden',
  },
  actionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  textContainer: {
    gap: 6,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionDescription: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
});
