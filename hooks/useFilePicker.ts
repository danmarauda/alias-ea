/**
 * File Picker Hook
 * Handles document selection with support for multiple file types
 */

import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useState } from 'react';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface FilePickerResult {
  pickFile: () => Promise<PickedFile[] | undefined>;
  pickSingleFile: () => Promise<PickedFile | undefined>;
  isLoading: boolean;
}

export function useFilePicker(): FilePickerResult {
  const [isLoading, setIsLoading] = useState(false);

  const pickFile = async (): Promise<PickedFile[] | undefined> => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets) {
        return undefined;
      }

      return result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size,
      }));
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert(
        'Error',
        'Failed to pick file. Please try again.',
        [{ text: 'OK' }]
      );
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const pickSingleFile = async (): Promise<PickedFile | undefined> => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return undefined;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size,
      };
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert(
        'Error',
        'Failed to pick file. Please try again.',
        [{ text: 'OK' }]
      );
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickFile,
    pickSingleFile,
    isLoading,
  };
}
