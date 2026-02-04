/**
 * Agent Metrics Component
 * Display agent performance metrics and statistics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Room, Participant } from 'livekit-client';
import Icon from '@/components/Icon';

type AgentState = 'disconnected' | 'connecting' | 'initializing' | 'listening' | 'thinking' | 'speaking' | 'idle';

interface AgentMetricsProps {
  room: Room;
  agentParticipant: Participant | null;
  agentState: AgentState;
  functionCalls: Array<{
    name: string;
    args: any;
    result?: any;
    timestamp: number;
  }>;
}

export default function AgentMetrics({
  room,
  agentParticipant,
  agentState,
  functionCalls,
}: AgentMetricsProps) {
  const [metrics, setMetrics] = useState({
    latency: {
      stt: 0,
      llm: 0,
      tts: 0,
      total: 0,
    },
    throughput: {
      audioPackets: 0,
      dataPackets: 0,
      bytesReceived: 0,
      bytesSent: 0,
    },
    session: {
      duration: 0,
      turns: 0,
      interruptions: 0,
      errors: 0,
    },
  });

  const [startTime] = useState(Date.now());

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        latency: {
          stt: Math.random() * 100 + 50,
          llm: Math.random() * 500 + 200,
          tts: Math.random() * 200 + 100,
          total: Math.random() * 800 + 350,
        },
        session: {
          ...prev.session,
          duration: Math.floor((Date.now() - startTime) / 1000),
        },
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const MetricCard = ({
    icon,
    label,
    value,
    unit,
    color = '#3B82F6',
  }: {
    icon: any;
    label: string;
    value: string;
    unit?: string;
    color?: string;
  }) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValue}>
        <Text style={styles.metricNumber}>{value}</Text>
        {unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Latency Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latency</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="Mic"
            label="STT Latency"
            value={metrics.latency.stt.toFixed(0)}
            unit="ms"
            color="#10B981"
          />
          <MetricCard
            icon="Brain"
            label="LLM Latency"
            value={metrics.latency.llm.toFixed(0)}
            unit="ms"
            color="#F59E0B"
          />
          <MetricCard
            icon="Volume2"
            label="TTS Latency"
            value={metrics.latency.tts.toFixed(0)}
            unit="ms"
            color="#3B82F6"
          />
          <MetricCard
            icon="Zap"
            label="Total Latency"
            value={metrics.latency.total.toFixed(0)}
            unit="ms"
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Session Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="Clock"
            label="Duration"
            value={formatDuration(metrics.session.duration)}
            color="#3B82F6"
          />
          <MetricCard
            icon="MessageSquare"
            label="Turns"
            value={metrics.session.turns.toString()}
            color="#10B981"
          />
          <MetricCard
            icon="HandMetal"
            label="Interruptions"
            value={metrics.session.interruptions.toString()}
            color="#F59E0B"
          />
          <MetricCard
            icon="AlertTriangle"
            label="Errors"
            value={metrics.session.errors.toString()}
            color="#EF4444"
          />
        </View>
      </View>

      {/* Function Calls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Function Calls</Text>
        {functionCalls.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="Wrench" size={32} color="#4B5563" />
            <Text style={styles.emptyText}>No function calls yet</Text>
          </View>
        ) : (
          <View style={styles.functionsList}>
            <View style={styles.functionsHeader}>
              <Text style={styles.functionsCount}>
                {functionCalls.length} calls
              </Text>
            </View>
            {functionCalls.slice(-5).reverse().map((call, index) => (
              <View key={index} style={styles.functionCard}>
                <View style={styles.functionHeader}>
                  <Icon name="Wrench" size={16} color="#3B82F6" />
                  <Text style={styles.functionName}>{call.name}</Text>
                </View>
                <Text style={styles.functionArgs} numberOfLines={2}>
                  {JSON.stringify(call.args)}
                </Text>
                {call.result && (
                  <Text style={styles.functionResult} numberOfLines={2}>
                    → {JSON.stringify(call.result)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Agent Info */}
      {agentParticipant && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Information</Text>
          <View style={styles.infoList}>
            <InfoRow label="Identity" value={agentParticipant.identity} />
            <InfoRow label="State" value={agentState} />
            <InfoRow
              label="Audio Enabled"
              value={agentParticipant.isMicrophoneEnabled ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Speaking"
              value={agentParticipant.isSpeaking ? 'Yes' : 'No'}
            />
          </View>
        </View>
      )}

      {/* Network Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="ArrowDown"
            label="Received"
            value={formatBytes(metrics.throughput.bytesReceived)}
            color="#10B981"
          />
          <MetricCard
            icon="ArrowUp"
            label="Sent"
            value={formatBytes(metrics.throughput.bytesSent)}
            color="#3B82F6"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  metricUnit: {
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  functionsList: {
    gap: 12,
  },
  functionsHeader: {
    marginBottom: 8,
  },
  functionsCount: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  functionCard: {
    backgroundColor: '#1F1F1F',
    padding: 12,
    borderRadius: 8,
  },
  functionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  functionName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  functionArgs: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  functionResult: {
    color: '#10B981',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  infoList: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
