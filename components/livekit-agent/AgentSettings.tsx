/**
 * Agent Settings Component
 * Configure agent behavior and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { Room } from 'livekit-client';
import Icon from '@/components/Icon';
import { AgentMetadata } from '@/hooks/useAgentState';

interface AgentSettingsProps {
  room: Room;
  agentMetadata: AgentMetadata | null;
}

export default function AgentSettings({
  room,
  agentMetadata,
}: AgentSettingsProps) {
  // Agent behavior settings
  const [autoInterrupt, setAutoInterrupt] = useState(true);
  const [endOnSilence, setEndOnSilence] = useState(false);
  const [contextPersistence, setContextPersistence] = useState(true);
  const [voiceActivityDetection, setVoiceActivityDetection] = useState(true);

  // Audio settings
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);

  // LLM settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);

  // TTS settings
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('default');

  const voices = [
    { id: 'default', name: 'Default', description: 'Neutral voice' },
    { id: 'neural', name: 'Neural', description: 'Natural sounding' },
    { id: 'expressive', name: 'Expressive', description: 'Emotive voice' },
    { id: 'calm', name: 'Calm', description: 'Soothing tone' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Agent Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agent Information</Text>
        <View style={styles.infoCard}>
          <InfoRow
            icon="Bot"
            label="Name"
            value={agentMetadata?.name || 'AI Agent'}
          />
          <InfoRow
            icon="Tag"
            label="Version"
            value={agentMetadata?.version || '1.0.0'}
          />
          <InfoRow
            icon="Brain"
            label="Model"
            value={agentMetadata?.model || 'gpt-4o'}
          />
          <InfoRow
            icon="Server"
            label="Provider"
            value={agentMetadata?.provider || 'OpenAI'}
          />
        </View>
      </View>

      {/* Behavior Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Behavior</Text>
        
        <SettingRow
          icon="HandMetal"
          label="Auto Interrupt"
          description="Allow user to interrupt agent while speaking"
          value={autoInterrupt}
          onValueChange={setAutoInterrupt}
        />
        
        <SettingRow
          icon="VolumeX"
          label="End on Silence"
          description="Automatically end turn after silence"
          value={endOnSilence}
          onValueChange={setEndOnSilence}
        />
        
        <SettingRow
          icon="Database"
          label="Context Persistence"
          description="Remember conversation history"
          value={contextPersistence}
          onValueChange={setContextPersistence}
        />
        
        <SettingRow
          icon="Mic"
          label="Voice Activity Detection"
          description="Detect when user is speaking"
          value={voiceActivityDetection}
          onValueChange={setVoiceActivityDetection}
        />
      </View>

      {/* Audio Processing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Processing</Text>
        
        <SettingRow
          icon="AudioLines"
          label="Echo Cancellation"
          description="Remove audio feedback"
          value={echoCancellation}
          onValueChange={setEchoCancellation}
        />
        
        <SettingRow
          icon="AudioWaveform"
          label="Noise Suppression"
          description="Reduce background noise"
          value={noiseSuppression}
          onValueChange={setNoiseSuppression}
        />
        
        <SettingRow
          icon="Volume2"
          label="Auto Gain Control"
          description="Normalize audio levels"
          value={autoGainControl}
          onValueChange={setAutoGainControl}
        />
      </View>

      {/* LLM Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language Model</Text>
        
        <View style={styles.sliderSetting}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderLabel}>
              <Icon name="Thermometer" size={20} color="#9CA3AF" />
              <Text style={styles.settingLabel}>Temperature</Text>
            </View>
            <Text style={styles.sliderValue}>{temperature.toFixed(2)}</Text>
          </View>
          <Text style={styles.sliderDescription}>
            Higher = more creative, Lower = more focused
          </Text>
        </View>

        <View style={styles.sliderSetting}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderLabel}>
              <Icon name="Hash" size={20} color="#9CA3AF" />
              <Text style={styles.settingLabel}>Max Tokens</Text>
            </View>
            <Text style={styles.sliderValue}>{maxTokens}</Text>
          </View>
          <Text style={styles.sliderDescription}>
            Maximum response length
          </Text>
        </View>
      </View>

      {/* TTS Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text-to-Speech</Text>
        
        <View style={styles.voiceSelector}>
          <Text style={styles.settingLabel}>Voice</Text>
          {voices.map((voice) => (
            <Pressable
              key={voice.id}
              onPress={() => setSelectedVoice(voice.id)}
              style={[
                styles.voiceOption,
                selectedVoice === voice.id && styles.voiceOptionActive,
              ]}
            >
              <View style={styles.voiceInfo}>
                <Text
                  style={[
                    styles.voiceName,
                    selectedVoice === voice.id && styles.voiceNameActive,
                  ]}
                >
                  {voice.name}
                </Text>
                <Text style={styles.voiceDescription}>{voice.description}</Text>
              </View>
              {selectedVoice === voice.id && (
                <Icon name="Check" size={20} color="#3B82F6" />
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.sliderSetting}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderLabel}>
              <Icon name="Gauge" size={20} color="#9CA3AF" />
              <Text style={styles.settingLabel}>Speaking Speed</Text>
            </View>
            <Text style={styles.sliderValue}>{ttsSpeed.toFixed(1)}x</Text>
          </View>
        </View>
      </View>

      {/* Advanced */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced</Text>
        
        <Pressable style={styles.actionButton}>
          <Icon name="RotateCcw" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Reset Agent</Text>
        </Pressable>
        
        <Pressable style={[styles.actionButton, styles.actionButtonDanger]}>
          <Icon name="Trash2" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
            Clear Conversation History
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Icon name={icon} size={16} color="#9CA3AF" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: any;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Icon name={icon} size={20} color="#9CA3AF" />
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#374151', true: '#3B82F6' }}
        thumbColor="#FFFFFF"
      />
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
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoCard: {
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
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  sliderSetting: {
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderValue: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '700',
  },
  sliderDescription: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  voiceSelector: {
    gap: 8,
  },
  voiceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voiceOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  voiceNameActive: {
    color: '#3B82F6',
  },
  voiceDescription: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
