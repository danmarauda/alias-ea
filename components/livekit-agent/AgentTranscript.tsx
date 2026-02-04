/**
 * Agent Transcript Component
 * Display full conversation transcript with STT/TTS segments
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { TranscriptSegment } from '@/hooks/useAgentTranscription';
import Icon from '@/components/Icon';

interface AgentTranscriptProps {
  transcript: TranscriptSegment[];
  userTranscript: {
    current: string;
    final: string[];
  };
  agentTranscript: {
    current: string;
    final: string[];
  };
}

export default function AgentTranscript({
  transcript,
  userTranscript,
  agentTranscript,
}: AgentTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [transcript]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const exportTranscript = () => {
    // Export transcript as text
    const text = transcript
      .filter(s => s.isFinal)
      .map(s => `[${formatTime(s.timestamp)}] ${s.speaker === 'user' ? 'You' : 'Agent'}: ${s.text}`)
      .join('\n');
    
    console.log('Export transcript:', text);
    // In a real app, save to file or share
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversation Transcript</Text>
        <Pressable onPress={exportTranscript} style={styles.exportButton}>
          <Icon name="Download" size={20} color="#3B82F6" />
          <Text style={styles.exportText}>Export</Text>
        </Pressable>
      </View>

      {/* Transcript list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.transcriptList}
      >
        {transcript.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="FileText" size={48} color="#4B5563" />
            <Text style={styles.emptyText}>No transcript yet</Text>
            <Text style={styles.emptySubtext}>
              Start speaking to see the conversation transcript
            </Text>
          </View>
        ) : (
          <>
            {transcript
              .filter(s => s.isFinal)
              .map((segment) => (
                <View
                  key={segment.id}
                  style={[
                    styles.segment,
                    segment.speaker === 'agent' && styles.segmentAgent,
                  ]}
                >
                  <View style={styles.segmentHeader}>
                    <View style={styles.segmentSpeaker}>
                      <Icon
                        name={segment.speaker === 'user' ? 'User' : 'Bot'}
                        size={16}
                        color={segment.speaker === 'user' ? '#10B981' : '#3B82F6'}
                      />
                      <Text style={styles.segmentSpeakerText}>
                        {segment.speaker === 'user' ? 'You' : 'Agent'}
                      </Text>
                    </View>
                    <Text style={styles.segmentTime}>
                      {formatTime(segment.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.segmentText}>{segment.text}</Text>
                </View>
              ))}

            {/* Current transcripts (interim) */}
            {userTranscript.current && (
              <View style={[styles.segment, styles.segmentInterim]}>
                <View style={styles.segmentHeader}>
                  <View style={styles.segmentSpeaker}>
                    <Icon name="User" size={16} color="#10B981" />
                    <Text style={styles.segmentSpeakerText}>You (interim)</Text>
                  </View>
                </View>
                <Text style={[styles.segmentText, styles.segmentTextInterim]}>
                  {userTranscript.current}
                </Text>
              </View>
            )}

            {agentTranscript.current && (
              <View style={[styles.segment, styles.segmentAgent, styles.segmentInterim]}>
                <View style={styles.segmentHeader}>
                  <View style={styles.segmentSpeaker}>
                    <Icon name="Bot" size={16} color="#3B82F6" />
                    <Text style={styles.segmentSpeakerText}>Agent (interim)</Text>
                  </View>
                </View>
                <Text style={[styles.segmentText, styles.segmentTextInterim]}>
                  {agentTranscript.current}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Stats footer */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {transcript.filter(s => s.isFinal && s.speaker === 'user').length}
          </Text>
          <Text style={styles.statLabel}>User</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {transcript.filter(s => s.isFinal && s.speaker === 'agent').length}
          </Text>
          <Text style={styles.statLabel}>Agent</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{transcript.filter(s => s.isFinal).length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 6,
  },
  exportText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  transcriptList: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  segment: {
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  segmentAgent: {
    backgroundColor: '#1E3A5F',
  },
  segmentInterim: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentSpeaker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segmentSpeakerText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  segmentTime: {
    color: '#6B7280',
    fontSize: 11,
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  segmentTextInterim: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
});
