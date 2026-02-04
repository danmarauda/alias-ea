/**
 * Function Call Display Component
 * Show recent function calls with arguments and results
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@/components/Icon';

interface FunctionCall {
  name: string;
  args: any;
  result?: any;
  timestamp: number;
}

interface FunctionCallDisplayProps {
  calls: FunctionCall[];
}

export default function FunctionCallDisplay({ calls }: FunctionCallDisplayProps) {
  if (calls.length === 0) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="Wrench" size={16} color="#3B82F6" />
        <Text style={styles.headerText}>Function Calls</Text>
      </View>

      {calls.map((call, index) => (
        <View key={index} style={styles.callCard}>
          <View style={styles.callHeader}>
            <View style={styles.callTitle}>
              <View style={styles.callIcon}>
                <Icon name="Code" size={12} color="#3B82F6" />
              </View>
              <Text style={styles.callName}>{call.name}</Text>
            </View>
            <Text style={styles.callTime}>{formatTime(call.timestamp)}</Text>
          </View>

          {/* Arguments */}
          {Object.keys(call.args).length > 0 && (
            <View style={styles.callSection}>
              <Text style={styles.callSectionLabel}>Arguments:</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  {JSON.stringify(call.args, null, 2)}
                </Text>
              </View>
            </View>
          )}

          {/* Result */}
          {call.result && (
            <View style={styles.callSection}>
              <Text style={styles.callSectionLabel}>Result:</Text>
              <View style={[styles.codeBlock, styles.codeBlockResult]}>
                <Text style={styles.codeText}>
                  {JSON.stringify(call.result, null, 2)}
                </Text>
              </View>
            </View>
          )}

          {/* Status indicator */}
          <View style={styles.callStatus}>
            {call.result ? (
              <>
                <Icon name="CheckCircle" size={14} color="#10B981" />
                <Text style={[styles.callStatusText, { color: '#10B981' }]}>
                  Completed
                </Text>
              </>
            ) : (
              <>
                <Icon name="Loader" size={14} color="#F59E0B" />
                <Text style={[styles.callStatusText, { color: '#F59E0B' }]}>
                  Processing...
                </Text>
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  callCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  callTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  callTime: {
    color: '#6B7280',
    fontSize: 11,
  },
  callSection: {
    marginBottom: 8,
  },
  callSectionLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  codeBlock: {
    backgroundColor: '#0D0D0D',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  codeBlockResult: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  codeText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  callStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  callStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
