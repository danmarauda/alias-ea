/**
 * Attachment Preview Component
 * Displays image and file attachments with remove functionality
 */

import React from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import Icon from '@/components/Icon';

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export default function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) {
    return null;
  }

  const images = attachments.filter(a => a.type === 'image');
  const files = attachments.filter(a => a.type === 'file');

  return (
    <View style={styles.container}>
      {/* Image previews */}
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {images.map((image) => (
            <View key={image.id} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <Pressable
                onPress={() => onRemove(image.id)}
                style={styles.removeButton}
              >
                <Icon name="X" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <View style={styles.filesContainer}>
          {files.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <Icon name="File" size={20} color="#3B82F6" />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name || 'Unknown file'}
                </Text>
                {file.size && (
                  <Text style={styles.fileSize}>
                    {formatFileSize(file.size)}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => onRemove(file.id)}>
                <Icon name="X" size={18} color="#9CA3AF" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 12,
  },
  imageScroll: {
    flexGrow: 0,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1F1F1F',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filesContainer: {
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});
