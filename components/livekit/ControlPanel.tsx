/**
 * Control Panel Component
 * Bottom control bar with all media and control options
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { Room, Participant } from 'livekit-client';
import Icon from '@/components/Icon';

interface ControlPanelProps {
  room: Room;
  localParticipant: Participant;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  onDisconnect: () => void;
}

export default function ControlPanel({
  room,
  localParticipant,
  isMicEnabled,
  isCameraEnabled,
  onDisconnect,
}: ControlPanelProps) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');

  // Toggle microphone
  const toggleMic = useCallback(async () => {
    await room.localParticipant.setMicrophoneEnabled(!isMicEnabled);
  }, [room, isMicEnabled]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    await room.localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [room, isCameraEnabled]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await room.localParticipant.setScreenShareEnabled(false);
      setIsScreenSharing(false);
    } else {
      await room.localParticipant.setScreenShareEnabled(true);
      setIsScreenSharing(true);
    }
  }, [room, isScreenSharing]);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    const newFacing = cameraFacing === 'front' ? 'back' : 'front';
    // Note: Actual implementation would call native module
    setCameraFacing(newFacing);
  }, [cameraFacing]);

  // Toggle recording (placeholder - requires server-side setup)
  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
    // In real implementation, call room API to start/stop recording
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {/* Main controls */}
      <View style={styles.mainControls}>
        {/* Microphone */}
        <Pressable
          onPress={toggleMic}
          style={[styles.controlButton, !isMicEnabled && styles.controlButtonDanger]}
        >
          <Icon
            name={isMicEnabled ? 'Mic' : 'MicOff'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.controlLabel}>
            {isMicEnabled ? 'Mute' : 'Unmute'}
          </Text>
        </Pressable>

        {/* Camera */}
        <Pressable
          onPress={toggleCamera}
          style={[styles.controlButton, !isCameraEnabled && styles.controlButtonDanger]}
        >
          <Icon
            name={isCameraEnabled ? 'Video' : 'VideoOff'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.controlLabel}>
            {isCameraEnabled ? 'Stop Video' : 'Start Video'}
          </Text>
        </Pressable>

        {/* Screen Share */}
        <Pressable
          onPress={toggleScreenShare}
          style={[styles.controlButton, isScreenSharing && styles.controlButtonActive]}
        >
          <Icon
            name="Monitor"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.controlLabel}>Share</Text>
        </Pressable>

        {/* More options */}
        <Pressable
          onPress={() => setShowMoreOptions(true)}
          style={styles.controlButton}
        >
          <Icon name="MoreVertical" size={24} color="#FFFFFF" />
          <Text style={styles.controlLabel}>More</Text>
        </Pressable>

        {/* Disconnect */}
        <Pressable
          onPress={onDisconnect}
          style={[styles.controlButton, styles.controlButtonDanger]}
        >
          <Icon name="PhoneOff" size={24} color="#FFFFFF" />
          <Text style={styles.controlLabel}>End</Text>
        </Pressable>
      </View>

      {/* More Options Modal */}
      <Modal
        visible={showMoreOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMoreOptions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Options</Text>
              <Pressable onPress={() => setShowMoreOptions(false)}>
                <Icon name="X" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <ScrollView style={styles.optionsList}>
              {/* Switch Camera */}
              {isCameraEnabled && (
                <Pressable style={styles.option} onPress={switchCamera}>
                  <Icon name="SwitchCamera" size={20} color="#FFFFFF" />
                  <Text style={styles.optionText}>
                    Switch to {cameraFacing === 'front' ? 'Back' : 'Front'} Camera
                  </Text>
                </Pressable>
              )}

              {/* Recording */}
              <Pressable style={styles.option} onPress={toggleRecording}>
                <Icon
                  name={isRecording ? 'StopCircle' : 'Circle'}
                  size={20}
                  color={isRecording ? '#EF4444' : '#FFFFFF'}
                />
                <Text style={styles.optionText}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Text>
                {isRecording && <View style={styles.recordingIndicator} />}
              </Pressable>

              {/* Noise Cancellation */}
              <Pressable style={styles.option}>
                <Icon name="AudioLines" size={20} color="#FFFFFF" />
                <Text style={styles.optionText}>Noise Cancellation</Text>
              </Pressable>

              {/* Background Blur */}
              <Pressable style={styles.option}>
                <Icon name="Sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.optionText}>Background Effects</Text>
              </Pressable>

              {/* Picture in Picture */}
              <Pressable style={styles.option}>
                <Icon name="PictureInPicture2" size={20} color="#FFFFFF" />
                <Text style={styles.optionText}>Picture-in-Picture</Text>
              </Pressable>

              {/* Raise Hand */}
              <Pressable style={styles.option}>
                <Icon name="Hand" size={20} color="#FFFFFF" />
                <Text style={styles.optionText}>Raise Hand</Text>
              </Pressable>

              {/* Virtual Background */}
              <Pressable style={styles.option}>
                <Icon name="Image" size={20} color="#FFFFFF" />
                <Text style={styles.optionText}>Virtual Background</Text>
              </Pressable>

              {/* Speaker Settings */}
              <Pressable style={styles.option}>
                <Icon name="Volume2" size={20} color="#FFFFFF" />
                <Text style={styles.optionText}>Speaker Settings</Text>
              </Pressable>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  controlButtonDanger: {
    backgroundColor: '#EF4444',
  },
  controlButtonActive: {
    backgroundColor: '#3B82F6',
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
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
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
    marginBottom: 8,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
