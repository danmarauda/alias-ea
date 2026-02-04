/**
 * Participant Grid Component
 * Displays video participants in grid, spotlight, or sidebar layout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { Participant, Track } from 'livekit-client';
import { VideoTrack, useIsSpeaking, TrackReference } from '@livekit/react-native';
import Icon from '@/components/Icon';

type LayoutMode = 'grid' | 'spotlight' | 'sidebar';

interface ParticipantGridProps {
  participants: Participant[];
  localParticipant: Participant;
  tracks: TrackReference[];
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
}

export default function ParticipantGrid({
  participants,
  localParticipant,
  tracks,
  layoutMode,
  onLayoutModeChange,
}: ParticipantGridProps) {
  const [spotlightParticipant, setSpotlightParticipant] = useState<Participant | null>(null);
  const { width, height } = Dimensions.get('window');

  // Get video tracks for a participant
  const getVideoTrackForParticipant = (participant: Participant): TrackReference | undefined => {
    return tracks.find(
      (track) =>
        track.participant.identity === participant.identity &&
        (track.source === Track.Source.Camera || track.source === Track.Source.ScreenShare)
    );
  };

  // Calculate grid dimensions
  const getGridDimensions = (count: number) => {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    return { cols, rows };
  };

  const allParticipants = [localParticipant, ...participants.filter((p) => p.identity !== localParticipant.identity)];
  const { cols, rows } = getGridDimensions(allParticipants.length);
  
  const tileWidth = (width - 32 - (cols - 1) * 8) / cols;
  const tileHeight = layoutMode === 'grid' ? tileWidth * 0.75 : height - 200;

  return (
    <View style={styles.container}>
      {/* Layout mode selector */}
      <View style={styles.layoutSelector}>
        <Pressable
          onPress={() => onLayoutModeChange('grid')}
          style={[styles.layoutButton, layoutMode === 'grid' && styles.layoutButtonActive]}
        >
          <Icon name="Grid3x3" size={16} color={layoutMode === 'grid' ? '#FFFFFF' : '#9CA3AF'} />
          <Text style={[styles.layoutButtonText, layoutMode === 'grid' && styles.layoutButtonTextActive]}>Grid</Text>
        </Pressable>
        
        <Pressable
          onPress={() => onLayoutModeChange('spotlight')}
          style={[styles.layoutButton, layoutMode === 'spotlight' && styles.layoutButtonActive]}
        >
          <Icon name="Maximize2" size={16} color={layoutMode === 'spotlight' ? '#FFFFFF' : '#9CA3AF'} />
          <Text style={[styles.layoutButtonText, layoutMode === 'spotlight' && styles.layoutButtonTextActive]}>Spotlight</Text>
        </Pressable>
        
        <Pressable
          onPress={() => onLayoutModeChange('sidebar')}
          style={[styles.layoutButton, layoutMode === 'sidebar' && styles.layoutButtonActive]}
        >
          <Icon name="SidebarClose" size={16} color={layoutMode === 'sidebar' ? '#FFFFFF' : '#9CA3AF'} />
          <Text style={[styles.layoutButtonText, layoutMode === 'sidebar' && styles.layoutButtonTextActive]}>Sidebar</Text>
        </Pressable>
      </View>

      {/* Grid layout */}
      {layoutMode === 'grid' && (
        <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContainer}>
          {allParticipants.map((participant) => {
            const videoTrack = getVideoTrackForParticipant(participant);
            return (
              <View
                key={participant.identity}
                style={[styles.gridTile, { width: tileWidth, height: tileHeight }]}
              >
                <ParticipantTile
                  participant={participant}
                  trackRef={videoTrack}
                  isLocal={participant.identity === localParticipant.identity}
                  onTap={() => {
                    setSpotlightParticipant(participant);
                    onLayoutModeChange('spotlight');
                  }}
                />
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Spotlight layout */}
      {layoutMode === 'spotlight' && (
        <View style={styles.spotlightContainer}>
          <View style={styles.spotlightMain}>
            {spotlightParticipant && (
              <ParticipantTile
                participant={spotlightParticipant}
                trackRef={getVideoTrackForParticipant(spotlightParticipant)}
                isLocal={spotlightParticipant.identity === localParticipant.identity}
                isSpotlight
              />
            )}
          </View>
          
          <ScrollView horizontal style={styles.spotlightThumbnails} contentContainerStyle={styles.thumbnailsContent}>
            {allParticipants.filter((p) => p.identity !== spotlightParticipant?.identity).map((participant) => {
              const videoTrack = getVideoTrackForParticipant(participant);
              return (
                <Pressable
                  key={participant.identity}
                  onPress={() => setSpotlightParticipant(participant)}
                  style={styles.thumbnail}
                >
                  <ParticipantTile
                    participant={participant}
                    trackRef={videoTrack}
                    isLocal={participant.identity === localParticipant.identity}
                    isThumbnail
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Sidebar layout */}
      {layoutMode === 'sidebar' && (
        <View style={styles.sidebarContainer}>
          <View style={styles.sidebarMain}>
            {spotlightParticipant && (
              <ParticipantTile
                participant={spotlightParticipant}
                trackRef={getVideoTrackForParticipant(spotlightParticipant)}
                isLocal={spotlightParticipant.identity === localParticipant.identity}
                isSpotlight
              />
            )}
          </View>
          
          <ScrollView style={styles.sidebar}>
            {allParticipants.filter((p) => p.identity !== spotlightParticipant?.identity).map((participant) => {
              const videoTrack = getVideoTrackForParticipant(participant);
              return (
                <Pressable
                  key={participant.identity}
                  onPress={() => setSpotlightParticipant(participant)}
                  style={styles.sidebarTile}
                >
                  <ParticipantTile
                    participant={participant}
                    trackRef={videoTrack}
                    isLocal={participant.identity === localParticipant.identity}
                    isThumbnail
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

/**
 * Individual Participant Tile
 */
interface ParticipantTileProps {
  participant: Participant;
  trackRef?: TrackReference;
  isLocal: boolean;
  isSpotlight?: boolean;
  isThumbnail?: boolean;
  onTap?: () => void;
}

function ParticipantTile({
  participant,
  trackRef,
  isLocal,
  isSpotlight = false,
  isThumbnail = false,
  onTap,
}: ParticipantTileProps) {
  const isSpeaking = useIsSpeaking(participant);
  const hasVideo = trackRef && trackRef.publication?.isSubscribed;
  const isMuted = !participant.isMicrophoneEnabled;
  const isScreenShare = trackRef?.source === Track.Source.ScreenShare;

  return (
    <Pressable
      onPress={onTap}
      style={[
        styles.tile,
        isSpeaking && styles.tileSpeaking,
        isSpotlight && styles.tileSpotlight,
      ]}
    >
      {hasVideo ? (
        <VideoTrack trackRef={trackRef!} style={styles.video} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {participant.identity.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {/* Overlay info */}
      <View style={styles.tileOverlay}>
        <View style={styles.tileInfo}>
          <Text style={styles.participantName} numberOfLines={1}>
            {participant.identity} {isLocal && '(You)'}
          </Text>
          
          <View style={styles.tileIcons}>
            {isScreenShare && (
              <View style={styles.iconBadge}>
                <Icon name="Monitor" size={12} color="#FFFFFF" />
              </View>
            )}
            {isMuted && (
              <View style={styles.iconBadge}>
                <Icon name="MicOff" size={12} color="#EF4444" />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Speaking indicator */}
      {isSpeaking && !isThumbnail && (
        <View style={styles.speakingIndicator} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  layoutSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111111',
  },
  layoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1F1F1F',
  },
  layoutButtonActive: {
    backgroundColor: '#3B82F6',
  },
  layoutButtonText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  layoutButtonTextActive: {
    color: '#FFFFFF',
  },
  gridScroll: {
    flex: 1,
  },
  gridContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridTile: {
    marginBottom: 8,
  },
  spotlightContainer: {
    flex: 1,
  },
  spotlightMain: {
    flex: 1,
    padding: 16,
  },
  spotlightThumbnails: {
    height: 120,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  thumbnailsContent: {
    padding: 12,
    gap: 8,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sidebarContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarMain: {
    flex: 1,
    padding: 16,
  },
  sidebar: {
    width: 120,
    backgroundColor: '#111111',
    borderLeftWidth: 1,
    borderLeftColor: '#1F1F1F',
    padding: 12,
  },
  sidebarTile: {
    width: 96,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1F1F1F',
    position: 'relative',
  },
  tileSpeaking: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  tileSpotlight: {
    borderRadius: 12,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  tileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  tileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  tileIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
});
