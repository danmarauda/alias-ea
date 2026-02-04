/**
 * Settings Panel Component
 * Device selection and audio/video settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { Room, Participant, createLocalAudioTrack, createLocalVideoTrack } from 'livekit-client';
import Icon from '@/components/Icon';

interface SettingsPanelProps {
  room: Room;
  localParticipant: Participant;
}

export default function SettingsPanel({
  room,
  localParticipant,
}: SettingsPanelProps) {
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('default');
  const [selectedCamera, setSelectedCamera] = useState<string>('default');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('default');
  
  // Audio settings
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  
  // Video settings
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [enableSimulcast, setEnableSimulcast] = useState(true);
  const [enableDynacast, setEnableDynacast] = useState(true);
  
  // Advanced settings
  const [e2eeEnabled, setE2eeEnabled] = useState(false);
  const [adaptiveStream, setAdaptiveStream] = useState(true);

  // Get video resolution based on quality
  const getVideoConstraints = () => {
    switch (videoQuality) {
      case 'low':
        return { width: 320, height: 180, frameRate: 15 };
      case 'medium':
        return { width: 640, height: 360, frameRate: 30 };
      case 'high':
        return { width: 1280, height: 720, frameRate: 30 };
    }
  };

  // Apply audio settings
  const applyAudioSettings = async () => {
    try {
      const constraints = {
        echoCancellation,
        noiseSuppression: noiseCancellation,
        autoGainControl,
      };
      
      // Create new audio track with settings
      const audioTrack = await createLocalAudioTrack(constraints);
      
      // Publish new audio track via room
      await room.localParticipant.publishTrack(audioTrack, {
        name: 'microphone',
      });
    } catch (error) {
      console.error('Failed to apply audio settings:', error);
    }
  };

  // Apply video settings
  const applyVideoSettings = async () => {
    try {
      const constraints = getVideoConstraints();
      
      // Create new video track with settings
      const videoTrack = await createLocalVideoTrack({
        resolution: {
          width: constraints.width,
          height: constraints.height,
          frameRate: constraints.frameRate,
        },
      });
      
      // Publish new video track via room
      await room.localParticipant.publishTrack(videoTrack, {
        name: 'camera',
        simulcast: enableSimulcast,
      });
    } catch (error) {
      console.error('Failed to apply video settings:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Audio Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Devices</Text>
        
        <View style={styles.deviceSelector}>
          <Icon name="Mic" size={20} color="#9CA3AF" />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceLabel}>Microphone</Text>
            <Text style={styles.deviceName}>{selectedMicrophone}</Text>
          </View>
          <Icon name="ChevronRight" size={20} color="#6B7280" />
        </View>

        <View style={styles.deviceSelector}>
          <Icon name="Volume2" size={20} color="#9CA3AF" />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceLabel}>Speaker</Text>
            <Text style={styles.deviceName}>{selectedSpeaker}</Text>
          </View>
          <Icon name="ChevronRight" size={20} color="#6B7280" />
        </View>
      </View>

      {/* Video Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Video Devices</Text>
        
        <View style={styles.deviceSelector}>
          <Icon name="Video" size={20} color="#9CA3AF" />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceLabel}>Camera</Text>
            <Text style={styles.deviceName}>{selectedCamera}</Text>
          </View>
          <Icon name="ChevronRight" size={20} color="#6B7280" />
        </View>
      </View>

      {/* Audio Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Settings</Text>
        
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Noise Cancellation</Text>
            <Text style={styles.settingDescription}>
              Reduce background noise
            </Text>
          </View>
          <Switch
            value={noiseCancellation}
            onValueChange={(value) => {
              setNoiseCancellation(value);
              applyAudioSettings();
            }}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Echo Cancellation</Text>
            <Text style={styles.settingDescription}>
              Prevent audio feedback
            </Text>
          </View>
          <Switch
            value={echoCancellation}
            onValueChange={(value) => {
              setEchoCancellation(value);
              applyAudioSettings();
            }}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Gain Control</Text>
            <Text style={styles.settingDescription}>
              Automatically adjust volume
            </Text>
          </View>
          <Switch
            value={autoGainControl}
            onValueChange={(value) => {
              setAutoGainControl(value);
              applyAudioSettings();
            }}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Video Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Video Settings</Text>
        
        <View style={styles.qualitySelector}>
          <Text style={styles.settingLabel}>Video Quality</Text>
          <View style={styles.qualityOptions}>
            {(['low', 'medium', 'high'] as const).map((quality) => (
              <Pressable
                key={quality}
                onPress={() => {
                  setVideoQuality(quality);
                  applyVideoSettings();
                }}
                style={[
                  styles.qualityOption,
                  videoQuality === quality && styles.qualityOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.qualityOptionText,
                    videoQuality === quality && styles.qualityOptionTextActive,
                  ]}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Simulcast</Text>
            <Text style={styles.settingDescription}>
              Send multiple video qualities
            </Text>
          </View>
          <Switch
            value={enableSimulcast}
            onValueChange={(value) => {
              setEnableSimulcast(value);
              applyVideoSettings();
            }}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Dynacast</Text>
            <Text style={styles.settingDescription}>
              Adaptive layer subscription
            </Text>
          </View>
          <Switch
            value={enableDynacast}
            onValueChange={setEnableDynacast}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Advanced Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced</Text>
        
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>End-to-End Encryption</Text>
            <Text style={styles.settingDescription}>
              Secure communication (Beta)
            </Text>
          </View>
          <Switch
            value={e2eeEnabled}
            onValueChange={setE2eeEnabled}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Adaptive Stream</Text>
            <Text style={styles.settingDescription}>
              Adjust quality based on bandwidth
            </Text>
          </View>
          <Switch
            value={adaptiveStream}
            onValueChange={setAdaptiveStream}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* SDK Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>LiveKit SDK Version</Text>
          <Text style={styles.infoValue}>2.9.6</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Room Name</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {room.name || 'N/A'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  deviceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 2,
  },
  deviceName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    color: '#6B7280',
    fontSize: 13,
  },
  qualitySelector: {
    marginBottom: 16,
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  qualityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  qualityOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  qualityOptionText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  qualityOptionTextActive: {
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  },
});
