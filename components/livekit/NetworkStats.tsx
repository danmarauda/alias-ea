/**
 * Network Stats Component
 * Display detailed network statistics and diagnostics
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

interface NetworkStatsProps {
  room: Room;
  participants: Participant[];
}

export default function NetworkStats({ room, participants }: NetworkStatsProps) {
  const [stats, setStats] = useState({
    bandwidth: { upload: 0, download: 0 },
    packetLoss: 0,
    latency: 0,
    jitter: 0,
    fps: 0,
  });

  // Simulate stats update (in real implementation, use room.getStats())
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        bandwidth: {
          upload: Math.random() * 1000 + 500,
          download: Math.random() * 2000 + 1000,
        },
        packetLoss: Math.random() * 2,
        latency: Math.random() * 50 + 20,
        jitter: Math.random() * 10 + 2,
        fps: Math.floor(Math.random() * 5) + 25,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatBandwidth = (kbps: number) => {
    if (kbps > 1000) {
      return `${(kbps / 1000).toFixed(2)} Mbps`;
    }
    return `${kbps.toFixed(0)} Kbps`;
  };

  const StatCard = ({
    icon,
    label,
    value,
    unit,
    status,
  }: {
    icon: string;
    label: string;
    value: string;
    unit?: string;
    status?: 'good' | 'warning' | 'error';
  }) => {
    const statusColors = {
      good: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    };

    return (
      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <Icon
            name={icon as any}
            size={20}
            color={status ? statusColors[status] : '#9CA3AF'}
          />
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <View style={styles.statValue}>
          <Text style={[styles.statNumber, status && { color: statusColors[status] }]}>
            {value}
          </Text>
          {unit && <Text style={styles.statUnit}>{unit}</Text>}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Quality</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            icon="ArrowUp"
            label="Upload"
            value={formatBandwidth(stats.bandwidth.upload)}
            status={stats.bandwidth.upload > 500 ? 'good' : 'warning'}
          />
          <StatCard
            icon="ArrowDown"
            label="Download"
            value={formatBandwidth(stats.bandwidth.download)}
            status={stats.bandwidth.download > 1000 ? 'good' : 'warning'}
          />
          <StatCard
            icon="Zap"
            label="Latency"
            value={stats.latency.toFixed(0)}
            unit="ms"
            status={stats.latency < 50 ? 'good' : stats.latency < 100 ? 'warning' : 'error'}
          />
          <StatCard
            icon="Activity"
            label="Jitter"
            value={stats.jitter.toFixed(1)}
            unit="ms"
            status={stats.jitter < 5 ? 'good' : stats.jitter < 10 ? 'warning' : 'error'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Video Quality</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            icon="Video"
            label="Frame Rate"
            value={stats.fps.toString()}
            unit="fps"
            status={stats.fps >= 25 ? 'good' : 'warning'}
          />
          <StatCard
            icon="AlertTriangle"
            label="Packet Loss"
            value={stats.packetLoss.toFixed(2)}
            unit="%"
            status={stats.packetLoss < 1 ? 'good' : stats.packetLoss < 3 ? 'warning' : 'error'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Room Information</Text>
        
        <View style={styles.infoList}>
          <InfoRow label="Room Name" value={room.name || 'N/A'} />
          <InfoRow label="Room Name" value={room.name || 'N/A'} truncate />
          <InfoRow label="Participants" value={participants.length.toString()} />
          <InfoRow label="Connection State" value={room.state || 'N/A'} truncate />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participant Details</Text>
        
        {participants.map((participant) => (
          <View key={participant.identity} style={styles.participantCard}>
            <View style={styles.participantHeader}>
              <Text style={styles.participantName}>{participant.identity}</Text>
              <View style={styles.participantBadges}>
                {participant.isMicrophoneEnabled && (
                  <View style={styles.badge}>
                    <Icon name="Mic" size={12} color="#10B981" />
                  </View>
                )}
                {participant.isCameraEnabled && (
                  <View style={styles.badge}>
                    <Icon name="Video" size={12} color="#10B981" />
                  </View>
                )}
              </View>
            </View>
            <View style={styles.participantStats}>
              <Text style={styles.participantStatText}>
                Identity: {participant.identity}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostics</Text>
        
        <View style={styles.diagnosticsList}>
          <DiagnosticRow
            label="WebRTC Connection"
            status="good"
            value="Connected"
          />
          <DiagnosticRow
            label="ICE Connection State"
            status="good"
            value="Connected"
          />
          <DiagnosticRow
            label="Signaling State"
            status="good"
            value="Stable"
          />
          <DiagnosticRow
            label="Adaptive Stream"
            status="good"
            value="Enabled"
          />
          <DiagnosticRow
            label="Simulcast"
            status="good"
            value="Active"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const InfoRow = ({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={styles.infoValue}
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? 'middle' : undefined}
    >
      {value}
    </Text>
  </View>
);

const DiagnosticRow = ({
  label,
  status,
  value,
}: {
  label: string;
  status: 'good' | 'warning' | 'error';
  value: string;
}) => {
  const statusColors = {
    good: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  return (
    <View style={styles.diagnosticRow}>
      <View style={[styles.statusDot, { backgroundColor: statusColors[status] }]} />
      <Text style={styles.diagnosticLabel}>{label}</Text>
      <Text style={[styles.diagnosticValue, { color: statusColors[status] }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  statUnit: {
    color: '#6B7280',
    fontSize: 14,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  participantCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  participantBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantStats: {
    gap: 4,
  },
  participantStatText: {
    color: '#6B7280',
    fontSize: 12,
  },
  diagnosticsList: {
    gap: 12,
  },
  diagnosticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  diagnosticLabel: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 14,
  },
  diagnosticValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
