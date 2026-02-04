/**
 * Connection Quality Indicator
 * Shows network quality for a participant
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Participant, ConnectionQuality as LKConnectionQuality } from 'livekit-client';
import Icon from '@/components/Icon';

interface ConnectionQualityProps {
  participant: Participant;
}

export default function ConnectionQuality({ participant }: ConnectionQualityProps) {
  // Use participant's connectionQuality property
  const quality = participant.connectionQuality || LKConnectionQuality.Unknown;

  const getQualityInfo = () => {
    switch (quality) {
      case LKConnectionQuality.Excellent:
        return {
          label: 'Excellent',
          color: '#10B981',
          icon: 'Wifi' as const,
          bars: 3,
        };
      case LKConnectionQuality.Good:
        return {
          label: 'Good',
          color: '#10B981',
          icon: 'Wifi' as const,
          bars: 2,
        };
      case LKConnectionQuality.Poor:
        return {
          label: 'Poor',
          color: '#F59E0B',
          icon: 'WifiOff' as const,
          bars: 1,
        };
      case LKConnectionQuality.Lost:
        return {
          label: 'Lost',
          color: '#EF4444',
          icon: 'WifiOff' as const,
          bars: 0,
        };
      default:
        return {
          label: 'Unknown',
          color: '#6B7280',
          icon: 'Wifi' as const,
          bars: 0,
        };
    }
  };

  const info = getQualityInfo();

  return (
    <View style={styles.container}>
      <Icon name={info.icon} size={16} color={info.color} />
      <View style={styles.bars}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { height: (index + 1) * 4 + 4 },
              index < info.bars ? { backgroundColor: info.color } : styles.barInactive,
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
  barInactive: {
    backgroundColor: '#374151',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
