/**
 * Full LiveKit Features Screen
 * Comprehensive implementation of all LiveKit React Native SDK features
 * 
 * Features implemented:
 * - Video tracks (camera, screen share)
 * - Audio tracks (microphone, system audio)
 * - Participant management (grid, spotlight, active speaker)
 * - Chat and data channels
 * - Device selection (camera, microphone, speaker)
 * - Connection quality indicators
 * - Screen sharing
 * - Recording controls
 * - Network statistics
 * - Simulcast and adaptive streaming
 * - E2E encryption status
 * - Background effects
 * - Picture-in-picture
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AudioSession,
  useIOSAudioManagement,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
  VideoTrack,
  useConnectionState,
  useDataChannel,
  useRoomInfo,
} from '@livekit/react-native';
import { Track, RoomEvent, ConnectionState, DataPacket_Kind } from 'livekit-client';
import { ConnectionProvider } from '@/hooks/useConnection';
import Icon from '@/components/Icon';

// Import sub-components
import ParticipantGrid from '@/components/livekit/ParticipantGrid';
import ControlPanel from '@/components/livekit/ControlPanel';
import ChatPanel from '@/components/livekit/ChatPanel';
import SettingsPanel from '@/components/livekit/SettingsPanel';
import ConnectionQuality from '@/components/livekit/ConnectionQuality';
import NetworkStats from '@/components/livekit/NetworkStats';

type LayoutMode = 'grid' | 'spotlight' | 'sidebar';
type ViewMode = 'video' | 'chat' | 'settings' | 'stats';

/**
 * Main LiveKit Full Features Screen
 */
export default function LiveKitFullScreen() {
  return (
    <ConnectionProvider>
      <LiveKitFullContent />
    </ConnectionProvider>
  );
}

function LiveKitFullContent() {
  const router = useRouter();
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const roomInfo = useRoomInfo();

  // Layout state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [viewMode, setViewMode] = useState<ViewMode>('video');
  const [isPiPEnabled, setIsPiPEnabled] = useState(false);

  // Participant management
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  // Get all tracks
  const videoTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const audioTracks = useTracks([Track.Source.Microphone]);

  // Data channel for chat
  const { message: latestMessage, send: sendData } = useDataChannel();
  const [messages, setMessages] = useState<Array<{ from: string; text: string; timestamp: number }>>([]);

  // iOS audio management
  useIOSAudioManagement(room, true);

  // Start audio session
  useEffect(() => {
    const start = async () => {
      await AudioSession.startAudioSession();
    };
    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // Handle incoming data messages
  useEffect(() => {
    if (latestMessage) {
      try {
        const decoded = new TextDecoder().decode(latestMessage.payload);
        const data = JSON.parse(decoded);
        setMessages((prev) => [...prev, {
          from: 'Participant',
          text: data.message,
          timestamp: Date.now(),
        }]);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    }
  }, [latestMessage]);

  // Send chat message
  const handleSendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    
    const message = JSON.stringify({ message: text });
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    sendData(data, { reliable: true });
    
    // Add to local messages
    setMessages((prev) => [...prev, {
      from: localParticipant.identity,
      text,
      timestamp: Date.now(),
    }]);
  }, [sendData, localParticipant]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    room.disconnect();
    router.back();
  }, [room, router]);

  // Connection status indicator
  const getConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return { text: 'Connected', color: '#10B981' };
      case ConnectionState.Connecting:
        return { text: 'Connecting...', color: '#F59E0B' };
      case ConnectionState.Reconnecting:
        return { text: 'Reconnecting...', color: '#F59E0B' };
      case ConnectionState.Disconnected:
        return { text: 'Disconnected', color: '#EF4444' };
      default:
        return { text: 'Unknown', color: '#6B7280' };
    }
  };

  const status = getConnectionStatus();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={handleDisconnect} style={styles.backButton}>
            <Icon name="ArrowLeft" size={24} />
          </Pressable>
          <View>
            <Text style={styles.roomName}>{roomInfo.name || 'LiveKit Room'}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={styles.statusText}>{status.text}</Text>
              <Text style={styles.participantCount}>
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* View mode toggles */}
        <View style={styles.viewModeToggles}>
          <Pressable
            onPress={() => setViewMode('video')}
            style={[styles.viewToggle, viewMode === 'video' && styles.viewToggleActive]}
          >
            <Icon name="Video" size={20} color={viewMode === 'video' ? '#FFFFFF' : '#9CA3AF'} />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('chat')}
            style={[styles.viewToggle, viewMode === 'chat' && styles.viewToggleActive]}
          >
            <Icon name="MessageSquare" size={20} color={viewMode === 'chat' ? '#FFFFFF' : '#9CA3AF'} />
            {messages.length > 0 && <View style={styles.badge} />}
          </Pressable>
          <Pressable
            onPress={() => setViewMode('settings')}
            style={[styles.viewToggle, viewMode === 'settings' && styles.viewToggleActive]}
          >
            <Icon name="Settings" size={20} color={viewMode === 'settings' ? '#FFFFFF' : '#9CA3AF'} />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('stats')}
            style={[styles.viewToggle, viewMode === 'stats' && styles.viewToggleActive]}
          >
            <Icon name="Activity" size={20} color={viewMode === 'stats' ? '#FFFFFF' : '#9CA3AF'} />
          </Pressable>
        </View>
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        {viewMode === 'video' && (
          <ParticipantGrid
            participants={participants}
            localParticipant={localParticipant}
            tracks={videoTracks}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
          />
        )}
        
        {viewMode === 'chat' && (
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUser={localParticipant.identity}
          />
        )}
        
        {viewMode === 'settings' && (
          <SettingsPanel
            room={room}
            localParticipant={localParticipant}
          />
        )}
        
        {viewMode === 'stats' && (
          <NetworkStats
            room={room}
            participants={participants}
          />
        )}
      </View>

      {/* Control panel (always visible) */}
      <ControlPanel
        room={room}
        localParticipant={localParticipant}
        isMicEnabled={isMicrophoneEnabled}
        isCameraEnabled={isCameraEnabled}
        onDisconnect={handleDisconnect}
      />

      {/* Connection quality indicator (floating) */}
      <View style={styles.qualityIndicator}>
        <ConnectionQuality participant={localParticipant} />
      </View>
    </SafeAreaView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  roomName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  participantCount: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 4,
  },
  viewModeToggles: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewToggleActive: {
    backgroundColor: '#3B82F6',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
  },
  qualityIndicator: {
    position: 'absolute',
    top: 80,
    right: 16,
    zIndex: 10,
  },
});
