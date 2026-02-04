/**
 * Enhanced Audio Recording Hook
 * Adds duration tracking and better status management
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export interface EnhancedAudioRecordingResult {
  recordingStatus: RecordingStatus;
  recordingDuration: number;
  audioUri: string | null;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  formatDuration: (seconds: number) => string;
  isRecording: boolean;
}

export function useAudioRecordingEnhanced(): EnhancedAudioRecordingResult {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const startDurationTimer = useCallback(() => {
    durationIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permissions to record audio.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      // Set up status callback for audio levels
      recording.setOnRecordingStatusUpdate((status: Audio.RecordingStatus) => {
        if (status.isRecording && status.metering !== undefined) {
          // Convert dB to 0-1 range
          const normalizedLevel = Math.min(1, Math.max(0, (status.metering + 60) / 60));
          setAudioLevel(normalizedLevel);
        }
      });

      await recording.startAsync();

      recordingRef.current = recording;
      setRecordingStatus('recording');
      setRecordingDuration(0);
      setAudioUri(null);
      startDurationTimer();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [startDurationTimer]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      stopDurationTimer();

      if (!recordingRef.current) {
        return null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      recordingRef.current = null;
      setRecordingStatus('stopped');
      setAudioLevel(0);

      if (uri) {
        setAudioUri(uri);
        return uri;
      }

      return null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecordingStatus('idle');
      return null;
    }
  }, [stopDurationTimer]);

  const pauseRecording = useCallback(async () => {
    try {
      if (recordingRef.current && recordingStatus === 'recording') {
        await recordingRef.current.pauseAsync();
        setRecordingStatus('paused');
        stopDurationTimer();
      }
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }, [recordingStatus, stopDurationTimer]);

  const resumeRecording = useCallback(async () => {
    try {
      if (recordingRef.current && recordingStatus === 'paused') {
        await recordingRef.current.startAsync();
        setRecordingStatus('recording');
        startDurationTimer();
      }
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  }, [recordingStatus, startDurationTimer]);

  const cancelRecording = useCallback(async () => {
    try {
      stopDurationTimer();

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        
        // Delete the file if it exists
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
        
        recordingRef.current = null;
      }

      setRecordingStatus('idle');
      setRecordingDuration(0);
      setAudioUri(null);
      setAudioLevel(0);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }, [stopDurationTimer]);

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    recordingStatus,
    recordingDuration,
    audioUri,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    formatDuration,
    isRecording: recordingStatus === 'recording',
  };
}
