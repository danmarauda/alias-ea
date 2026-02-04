/**
 * Image Picker Hook
 * Handles image selection from gallery with multiple selection support
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useState } from 'react';

export interface ImagePickerResult {
  pickImage: () => Promise<string[] | undefined>;
  pickSingleImage: () => Promise<string | undefined>;
  isLoading: boolean;
}

export function useImagePicker(): ImagePickerResult {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async (): Promise<string[] | undefined> => {
    try {
      setIsLoading(true);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to select images.',
          [{ text: 'OK' }]
        );
        return undefined;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        return result.assets.map(asset => asset.uri);
      }

      return undefined;
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const pickSingleImage = async (): Promise<string | undefined> => {
    try {
      setIsLoading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to select images.',
          [{ text: 'OK' }]
        );
        return undefined;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return undefined;
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickImage,
    pickSingleImage,
    isLoading,
  };
}
