/**
 * Voice Agent Screen
 * 
 * Enhanced implementation combining:
 * - LiveKit Components React (recommended approach)
 * - Direct Room management (for fine-grained control)
 * - Reference patterns from agent-starter-react-native
 * 
 * Documentation References:
 * - React Native SDK: https://docs.livekit.io/transport/sdk-platforms/react-native
 * - Components: https://docs.livekit.io/frontends/start/frontends
 * - Audio Visualizer: https://docs.livekit.io/frontends/start/frontends/#audio-visualizer
 * - Agent Sessions: https://docs.livekit.io/agents/logic/sessions
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ConnectionProvider } from '@/hooks/useConnection';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AudioSession,
  useIOSAudioManagement,
  useLocalParticipant,
  useParticipantTracks,
  useRoomContext,
  VideoTrack,
} from '@livekit/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Track } from 'livekit-client';
import {
  type TrackReference,
  useAgent,
  useSessionMessages,
  useTrackToggle,
} from '@livekit/components-react';
import Animated, {
  useAnimatedValue,
} from 'react-native-reanimated';

// Import components
import AgentVisualization from '@/components/voice-agent/AgentVisualization';
import ChatBar from '@/components/voice-agent/ChatBar';
import ChatLog from '@/components/voice-agent/ChatLog';
import ControlBar from '@/components/voice-agent/ControlBar';
import { useConnection } from '@/hooks/useConnection';

const expandedAgentWidth = 1;
const expandedAgentHeight = 1;
const expandedLocalWidth = 0.3;
const expandedLocalHeight = 0.2;
const collapsedWidth = 0.3;
const collapsedHeight = 0.2;

/**
 * Main Voice Agent Screen
 * 
 * Uses LiveKit Components React for session management and UI components.
 * Falls back to legacy implementation if components are not available.
 */
export default function VoiceAgentScreen() {
  return (
    <ConnectionProvider>
      <VoiceAgentContent />
    </ConnectionProvider>
  );
}

function VoiceAgentContent() {
  // Start the audio session first (required for LiveKit)
  // Docs: https://docs.livekit.io/transport/sdk-platforms/react-native/#connect-to-a-room-publish-video-audio
  useEffect(() => {
    const start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <RoomView />
    </SafeAreaView>
  );
}

const RoomView = () => {
  const router = useRouter();
  const connection = useConnection();
  const room = useRoomContext();

  // iOS audio management
  // Docs: https://docs.livekit.io/transport/sdk-platforms/react-native/#integrate-into-your-project
  useIOSAudioManagement(room, true);

  // Agent state and tracks
  const { state: agentState } = useAgent();
  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    cameraTrack: localCameraTrack,
    localParticipant,
  } = useLocalParticipant();
  const localParticipantIdentity = localParticipant.identity;

  // Screen share track
  const localScreenShareTrack = useParticipantTracks(
    [Track.Source.ScreenShare],
    localParticipantIdentity
  );

  // Local video track (camera or screen share)
  const localVideoTrack =
    localCameraTrack && isCameraEnabled
      ? ({
          participant: localParticipant,
          publication: localCameraTrack,
          source: Track.Source.Camera,
        } satisfies TrackReference)
      : localScreenShareTrack.length > 0
      ? localScreenShareTrack[0]
      : null;

  // Messages/transcript
  // Docs: https://docs.livekit.io/frontends/start/frontends
  const { messages, send } = useSessionMessages();
  const [isChatEnabled, setChatEnabled] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const onChatSend = useCallback(
    (message: string) => {
      send(message);
      setChatMessage('');
    },
    [send]
  );

  // Control callbacks using LiveKit Components hooks
  // Docs: https://docs.livekit.io/frontends/start/frontends
  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const cameraToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenShareToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
  });

  const onChatClick = useCallback(() => {
    setChatEnabled(!isChatEnabled);
  }, [isChatEnabled]);

  const onExitClick = useCallback(() => {
    connection.disconnect();
    router.back();
  }, [connection, router]);

  // Layout positioning
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get('window').width
  );
  const [containerHeight, setContainerHeight] = useState(
    Dimensions.get('window').height
  );

  const agentVisualizationPosition = useAgentVisualizationPosition(
    isChatEnabled,
    isCameraEnabled || localScreenShareTrack.length > 0
  );
  const localVideoPosition = useLocalVideoPosition(isChatEnabled, {
    width: containerWidth,
    height: containerHeight,
  });

  // Agent state display text
  const getStateText = () => {
    if (!connection.isConnectionActive) {
      return 'Tap to connect';
    }
    switch (agentState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Ready';
      case 'speaking':
        return 'ALIAS is speaking...';
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Thinking...';
      default:
        return 'Connected';
    }
  };

  const localVideoView = localVideoTrack ? (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 1,
          ...localVideoPosition,
        },
      ]}
    >
      <VideoTrack trackRef={localVideoTrack} style={styles.video} />
    </Animated.View>
  ) : null;

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Agent</Text>
        <Text style={styles.headerSubtitle}>
          {connection.isConnectionActive ? getStateText() : 'Real-time voice conversation'}
        </Text>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Chat Log */}
      <ChatLog style={styles.logContainer} messages={messages} />

      {/* Chat Bar */}
      {isChatEnabled && (
        <ChatBar
          style={styles.chatBar}
          value={chatMessage}
          onChangeText={setChatMessage}
          onChatSend={onChatSend}
        />
      )}

      {/* Agent Visualization */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            zIndex: 1,
            backgroundColor: '#000000',
            ...agentVisualizationPosition,
          },
        ]}
      >
        <AgentVisualization style={styles.agentVisualization} />
      </Animated.View>

      {/* Local Video */}
      {localVideoView}

      {/* Control Bar */}
      <ControlBar
        style={styles.controlBar}
        options={{
          isMicEnabled: isMicrophoneEnabled,
          isCameraEnabled,
          isScreenShareEnabled: localScreenShareTrack.length > 0,
          isChatEnabled,
          onMicClick: micToggle.toggle,
          onCameraClick: cameraToggle.toggle,
          onScreenShareClick: screenShareToggle.toggle,
          onChatClick,
          onExitClick,
        }}
      />

      {/* Connect Button (when not connected) */}
      {!connection.isConnectionActive && (
        <View style={styles.connectButtonContainer}>
          <Animated.View style={styles.connectButton}>
            <Text style={styles.connectButtonText} onPress={connection.connect}>
              Connect to ALIAS
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

// Animation hooks for layout positioning
const createAnimConfig = (toValue: number): {
  toValue: number;
  stiffness: number;
  damping: number;
  useNativeDriver: boolean;
  isInteraction: boolean;
  overshootClamping: boolean;
} => {
  return {
    toValue,
    stiffness: 200,
    damping: 30,
    useNativeDriver: false,
    isInteraction: false,
    overshootClamping: true,
  };
};

const useAgentVisualizationPosition = (
  isChatVisible: boolean,
  hasLocalVideo: boolean
) => {
  const width = useAnimatedValue(
    isChatVisible ? collapsedWidth : expandedAgentWidth
  );
  const height = useAnimatedValue(
    isChatVisible ? collapsedHeight : expandedAgentHeight
  );

  useEffect(() => {
    const widthAnim = Animated.spring(
      width,
      createAnimConfig(isChatVisible ? collapsedWidth : expandedAgentWidth)
    );
    const heightAnim = Animated.spring(
      height,
      createAnimConfig(isChatVisible ? collapsedHeight : expandedAgentHeight)
    );

    widthAnim.start();
    heightAnim.start();

    return () => {
      widthAnim.stop();
      heightAnim.stop();
    };
  }, [width, height, isChatVisible]);

  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);
  useEffect(() => {
    let targetX: number;
    let targetY: number;

    if (!isChatVisible) {
      targetX = 0;
      targetY = 0;
    } else {
      if (!hasLocalVideo) {
        targetX = 0.5 - collapsedWidth / 2;
        targetY = 16;
      } else {
        targetX = 0.32 - collapsedWidth / 2;
        targetY = 16;
      }
    }

    const xAnim = Animated.spring(x, createAnimConfig(targetX));
    const yAnim = Animated.spring(y, createAnimConfig(targetY));

    xAnim.start();
    yAnim.start();

    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, [x, y, isChatVisible, hasLocalVideo]);

  return useAnimatedStyle(() => ({
    left: x.value * Dimensions.get('window').width,
    top: y.value,
    width: `${width.value * 100}%`,
    height: `${height.value * 100}%`,
  }));
};

const useLocalVideoPosition = (
  isChatVisible: boolean,
  containerDimens: { width: number; height: number }
): ViewStyle => {
  const width = useAnimatedValue(
    isChatVisible ? collapsedWidth : expandedLocalWidth
  );
  const height = useAnimatedValue(
    isChatVisible ? collapsedHeight : expandedLocalHeight
  );

  useEffect(() => {
    const widthAnim = Animated.spring(
      width,
      createAnimConfig(isChatVisible ? collapsedWidth : expandedLocalWidth)
    );
    const heightAnim = Animated.spring(
      height,
      createAnimConfig(isChatVisible ? collapsedHeight : expandedLocalHeight)
    );

    widthAnim.start();
    heightAnim.start();

    return () => {
      widthAnim.stop();
      heightAnim.stop();
    };
  }, [width, height, isChatVisible]);

  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);
  useEffect(() => {
    let targetX: number;
    let targetY: number;

    if (!isChatVisible) {
      targetX = 1 - expandedLocalWidth - 16 / containerDimens.width;
      targetY = 1 - expandedLocalHeight - 106 / containerDimens.height;
    } else {
      targetX = 0.66 - collapsedWidth / 2;
      targetY = 0;
    }

    const xAnim = Animated.spring(x, createAnimConfig(targetX));
    const yAnim = Animated.spring(y, createAnimConfig(targetY));
    xAnim.start();
    yAnim.start();
    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, [containerDimens.width, containerDimens.height, x, y, isChatVisible]);

  return useAnimatedStyle(() => ({
    left: `${x.value * 100}%`,
    top: `${y.value * 100}%`,
    width: `${width.value * 100}%`,
    height: `${height.value * 100}%`,
    marginTop: 16,
  })) as ViewStyle;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#202020',
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  spacer: {
    height: '24%',
  },
  logContainer: {
    width: '100%',
    flexGrow: 1,
    flexDirection: 'column',
    marginBottom: 8,
  },
  chatBar: {
    left: 0,
    right: 0,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  controlBar: {
    left: 0,
    right: 0,
    zIndex: 2,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  agentVisualization: {
    width: '100%',
    height: '100%',
  },
  connectButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
