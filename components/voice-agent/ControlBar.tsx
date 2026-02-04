/**
 * Control Bar Component
 * 
 * Provides controls for microphone, camera, screen share, chat, and exit.
 * Includes audio visualization for microphone input.
 * 
 * Based on LiveKit Components React patterns:
 * https://docs.livekit.io/frontends/start/frontends
 * 
 * Reference: agent-starter-react-native/app/assistant/ui/ControlBar.tsx
 */

import { TrackReference, useLocalParticipant } from '@livekit/components-react';
import { BarVisualizer } from '@livekit/react-native';
import { useEffect, useState } from 'react';
import {
  ViewStyle,
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
} from 'react-native';
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff } from 'lucide-react-native';

type ControlBarProps = {
  style?: StyleProp<ViewStyle>;
  options: ControlBarOptions;
};

type ControlBarOptions = {
  isMicEnabled: boolean;
  onMicClick: () => void;
  isCameraEnabled: boolean;
  onCameraClick: () => void;
  isScreenShareEnabled?: boolean;
  onScreenShareClick?: () => void;
  isChatEnabled: boolean;
  onChatClick: () => void;
  onExitClick: () => void;
};

export default function ControlBar({ style = {}, options }: ControlBarProps) {
  const { microphoneTrack, localParticipant } = useLocalParticipant();
  const [trackRef, setTrackRef] = useState<TrackReference | undefined>(
    undefined
  );

  useEffect(() => {
    if (microphoneTrack) {
      setTrackRef({
        participant: localParticipant,
        publication: microphoneTrack,
        source: microphoneTrack.source,
      });
    } else {
      setTrackRef(undefined);
    }
  }, [microphoneTrack, localParticipant]);

  return (
    <View style={[style, styles.container]}>
      <TouchableOpacity
        style={[
          styles.button,
          options.isMicEnabled ? styles.enabledButton : undefined,
        ]}
        activeOpacity={0.7}
        onPress={() => options.onMicClick()}
      >
        {options.isMicEnabled ? (
          <Mic size={20} color="#FFFFFF" />
        ) : (
          <MicOff size={20} color="#CCCCCC" />
        )}
        {trackRef && options.isMicEnabled && (
          <BarVisualizer
            barCount={3}
            trackRef={trackRef}
            style={styles.micVisualizer}
            options={{
              minHeight: 0.1,
              barColor: '#CCCCCC',
              barWidth: 2,
            }}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          options.isCameraEnabled ? styles.enabledButton : undefined,
        ]}
        activeOpacity={0.7}
        onPress={() => options.onCameraClick()}
      >
        {options.isCameraEnabled ? (
          <Video size={20} color="#FFFFFF" />
        ) : (
          <VideoOff size={20} color="#CCCCCC" />
        )}
      </TouchableOpacity>

      {options.onScreenShareClick && (
        <TouchableOpacity
          style={[
            styles.button,
            options.isScreenShareEnabled ? styles.enabledButton : undefined,
          ]}
          activeOpacity={0.7}
          onPress={() => options.onScreenShareClick?.()}
        >
          <View style={styles.iconPlaceholder} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          options.isChatEnabled ? styles.enabledButton : undefined,
        ]}
        activeOpacity={0.7}
        onPress={() => options.onChatClick()}
      >
        <MessageSquare size={20} color={options.isChatEnabled ? '#FFFFFF' : '#CCCCCC'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.exitButton]}
        activeOpacity={0.7}
        onPress={() => options.onExitClick()}
      >
        <PhoneOff size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 8,
    backgroundColor: '#070707',
    borderColor: '#202020',
    borderRadius: 53,
    borderWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    padding: 10,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enabledButton: {
    backgroundColor: '#131313',
  },
  exitButton: {
    backgroundColor: '#DC2626',
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
  },
  micVisualizer: {
    width: 20,
    height: 20,
    marginLeft: 4,
  },
});
