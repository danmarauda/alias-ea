/**
 * Agent Controls Component
 * Bottom control panel for agent interaction
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Switch,
} from 'react-native';
import { Room } from 'livekit-client';
import Icon from '@/components/Icon';

type AgentState = 'disconnected' | 'connecting' | 'initializing' | 'listening' | 'thinking' | 'speaking' | 'idle';

interface AgentControlsProps {
  room: Room;
  isMicEnabled: boolean;
  agentState: AgentState;
  isAgentConnected: boolean;
  onDisconnect: () => void;
}

export default function AgentControls({
  room,
  isMicEnabled,
  agentState,
  isAgentConnected,
  onDisconnect,
}: AgentControlsProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isInterruptible, setIsInterruptible] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);

  // Toggle microphone
  const toggleMic = async () => {
    await room.localParticipant.setMicrophoneEnabled(!isMicEnabled);
  };

  // Push to talk mode
  const handlePushToTalk = async (pressed: boolean) => {
    await room.localParticipant.setMicrophoneEnabled(pressed);
  };

  // Interrupt agent
  const interruptAgent = () => {
    // Send interrupt signal via data channel
    const message = JSON.stringify({ type: 'interrupt' });
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    room.localParticipant.publishData(data, { reliable: true });
  };

  return (
    <View style={styles.container}>
      {/* Main controls */}
      <View style={styles.mainControls}>
        {/* Microphone */}
        <Pressable
          onPress={toggleMic}
          style={[
            styles.controlButton,
            styles.micButton,
            !isMicEnabled && styles.controlButtonInactive,
          ]}
        >
          <Icon
            name={isMicEnabled ? 'Mic' : 'MicOff'}
            size={28}
            color="#FFFFFF"
          />
        </Pressable>

        {/* Interrupt button (only when agent is speaking) */}
        {agentState === 'speaking' && isInterruptible && (
          <Pressable
            onPress={interruptAgent}
            style={[styles.controlButton, styles.interruptButton]}
          >
            <Icon name="HandMetal" size={24} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Interrupt</Text>
          </Pressable>
        )}

        {/* More options */}
        <Pressable
          onPress={() => setShowOptions(true)}
          style={styles.controlButton}
        >
          <Icon name="MoreVertical" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Disconnect */}
        <Pressable
          onPress={onDisconnect}
          style={[styles.controlButton, styles.disconnectButton]}
        >
          <Icon name="PhoneOff" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Agent status indicator */}
      {isAgentConnected && (
        <View style={styles.statusBar}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, getStatusDotStyle(agentState)]} />
            <Text style={styles.statusText}>{getStatusText(agentState)}</Text>
          </View>
        </View>
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agent Options</Text>
              <Pressable onPress={() => setShowOptions(false)}>
                <Icon name="X" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View style={styles.optionsList}>
              {/* Interruptible */}
              <View style={styles.option}>
                <View style={styles.optionInfo}>
                  <Icon name="HandMetal" size={20} color="#FFFFFF" />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>Interruptible</Text>
                    <Text style={styles.optionDescription}>
                      Allow interrupting the agent while speaking
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isInterruptible}
                  onValueChange={setIsInterruptible}
                  trackColor={{ false: '#374151', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Auto reconnect */}
              <View style={styles.option}>
                <View style={styles.optionInfo}>
                  <Icon name="RefreshCw" size={20} color="#FFFFFF" />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>Auto Reconnect</Text>
                    <Text style={styles.optionDescription}>
                      Automatically reconnect if connection drops
                    </Text>
                  </View>
                </View>
                <Switch
                  value={autoReconnect}
                  onValueChange={setAutoReconnect}
                  trackColor={{ false: '#374151', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Push to talk */}
              <Pressable
                style={styles.optionButton}
                onPressIn={() => handlePushToTalk(true)}
                onPressOut={() => handlePushToTalk(false)}
              >
                <Icon name="Radio" size={20} color="#FFFFFF" />
                <Text style={styles.optionButtonText}>Hold to Talk</Text>
              </Pressable>

              {/* Clear transcript */}
              <Pressable style={styles.optionButton}>
                <Icon name="Trash2" size={20} color="#EF4444" />
                <Text style={[styles.optionButtonText, { color: '#EF4444' }]}>
                  Clear Transcript
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function getStatusText(state: AgentState): string {
  switch (state) {
    case 'listening':
      return 'Listening...';
    case 'thinking':
      return 'Processing...';
    case 'speaking':
      return 'Speaking...';
    case 'idle':
      return 'Ready';
    case 'initializing':
      return 'Initializing...';
    case 'connecting':
      return 'Connecting...';
    default:
      return 'Disconnected';
  }
}

function getStatusDotStyle(state: AgentState) {
  let backgroundColor = '#6B7280';
  
  switch (state) {
    case 'listening':
      backgroundColor = '#10B981';
      break;
    case 'thinking':
      backgroundColor = '#F59E0B';
      break;
    case 'speaking':
      backgroundColor = '#3B82F6';
      break;
    case 'idle':
      backgroundColor = '#10B981';
      break;
  }

  return { backgroundColor };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
  },
  controlButtonInactive: {
    backgroundColor: '#EF4444',
  },
  interruptButton: {
    backgroundColor: '#F59E0B',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    padding: 16,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
