import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Pressable } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Icon from './Icon';
import ThemedText from './ThemedText';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface CameraCaptureProps {
  isVisible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isVisible,
  onClose,
  onCapture,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const cameraRef = useRef<CameraView>(null);

  const requestCameraPermission = useCallback(async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to take photos.',
          [
            { text: 'Cancel', style: 'cancel', onPress: onClose },
            { text: 'Settings', onPress: () => {} }, // Would open settings in production
          ]
        );
        return false;
      }
    }
    return true;
  }, [permission, requestPermission, onClose]);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      // Resize and compress image for chat
      const manipulated = await manipulateAsync(
        uri,
        [
          { resize: { width: 1200 } }, // Max width for chat
        ],
        {
          compress: 0.8, // 80% quality
          format: SaveFormat.JPEG,
        }
      );
      return manipulated.uri;
    } catch (error) {
      console.error('Image optimization error:', error);
      return uri; // Return original if optimization fails
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (photo?.uri) {
        // Optimize the image
        const optimizedUri = await optimizeImage(photo.uri);
        onCapture(optimizedUri);
        onClose();
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isVisible) return null;

  // Show permission request screen if needed
  if (!permission?.granted) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.permissionContainer}
      >
        <StatusBar style="light" />
        <View style={styles.permissionContent}>
          <Icon name="Camera" size={64} color="#0EA5E9" />
          <ThemedText className="text-xl font-bold mt-4 mb-2">
            Camera Access
          </ThemedText>
          <ThemedText className="text-subtext text-center mb-6">
            ALIAS needs camera access to take photos for your messages.
          </ThemedText>
          <TouchableOpacity
            onPress={requestCameraPermission}
            style={styles.permissionButton}
          >
            <ThemedText className="text-white font-semibold">
              Allow Camera Access
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelButton}
          >
            <ThemedText className="text-subtext">Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Camera - no children allowed in expo-camera v16+ */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flashMode}
        mode="picture"
      />
      
      {/* Header controls - positioned absolutely */}
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          style={styles.headerButton}
          accessibilityLabel="Close camera"
          accessibilityHint="Double tap to close the camera"
        >
          <Icon name="X" size={28} color="white" />
        </Pressable>

        <Pressable
          onPress={toggleFlash}
          style={styles.headerButton}
          accessibilityLabel={`Flash: ${flashMode}`}
          accessibilityHint="Double tap to change flash mode"
        >
          <Icon
            name={flashMode === 'on' ? 'Zap' : flashMode === 'auto' ? 'ZapOff' : 'FlashlightOff'}
            size={24}
            color={flashMode === 'on' ? '#FCD34D' : 'white'}
          />
        </Pressable>
      </View>

      {/* Bottom controls - positioned absolutely */}
      <View style={styles.controls}>
        <Pressable
          onPress={toggleCameraFacing}
          style={styles.flipButton}
          accessibilityLabel="Flip camera"
          accessibilityHint="Double tap to switch between front and back camera"
        >
          <Icon name="RefreshCw" size={28} color="white" />
        </Pressable>

        <Pressable
          onPress={takePicture}
          disabled={isCapturing}
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          accessibilityLabel="Take photo"
          accessibilityHint="Double tap to capture a photo"
        >
          {isCapturing ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </Pressable>

        <View style={styles.flipButton} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  permissionContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#171717',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    padding: 32,
  },
  permissionButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 12,
  },
  cancelButton: {
    padding: 12,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
});

export default CameraCapture;
