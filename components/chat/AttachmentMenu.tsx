/**
 * Attachment Menu Component
 * Bottom sheet menu for selecting different attachment types
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@/components/Icon';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useFilePicker } from '@/hooks/useFilePicker';

interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onImagesSelected: (uris: string[]) => void;
  onFilesSelected: (files: Array<{ uri: string; name: string; mimeType: string; size?: number }>) => void;
}

export default function AttachmentMenu({
  visible,
  onClose,
  onImagesSelected,
  onFilesSelected,
}: AttachmentMenuProps) {
  const { pickImage } = useImagePicker();
  const { pickFile } = useFilePicker();

  const handleImageFromGallery = async () => {
    onClose();
    const uris = await pickImage();
    if (uris) {
      onImagesSelected(uris);
    }
  };

  const handleTakePhoto = async () => {
    onClose();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      onImagesSelected([result.assets[0].uri]);
    }
  };

  const handleUploadDocument = async () => {
    onClose();
    const files = await pickFile();
    if (files) {
      onFilesSelected(files);
    }
  };

  const menuItems = [
    {
      id: 'gallery',
      title: 'Choose from gallery',
      description: 'Select images from your photo library',
      icon: 'Image' as const,
      onPress: handleImageFromGallery,
    },
    {
      id: 'camera',
      title: 'Take photo',
      description: 'Use camera to take a new photo',
      icon: 'Camera' as const,
      onPress: handleTakePhoto,
    },
    {
      id: 'document',
      title: 'Upload document',
      description: 'Select files from your device',
      icon: 'FileText' as const,
      onPress: handleUploadDocument,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      </Pressable>

      <View style={styles.container}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Add attachment</Text>

          <View style={styles.menu}>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemIcon}>
                  <Icon name={item.icon} size={24} color="#3B82F6" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
                <Icon name="ChevronRight" size={20} color="#6B7280" />
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#1F1F1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingHorizontal: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#3D3D3D',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  menu: {
    gap: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    gap: 12,
  },
  menuItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemContent: {
    flex: 1,
    gap: 2,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  cancelButton: {
    padding: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
