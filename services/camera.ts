/**
 * Camera Service
 * Handles camera capture and permissions
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface CameraResult {
    uri: string;
    type: string;
    name: string;
    width: number;
    height: number;
    fileSize?: number;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
        Alert.alert(
            'Camera Permission Required',
            'ALIAS needs access to your camera to take photos. Please enable camera access in your device settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Open Settings', 
                    onPress: () => {
                        // Open app settings
                        if (typeof (globalThis as any).Linking !== 'undefined') {
                            (globalThis as any).Linking.openSettings();
                        }
                    }
                },
            ]
        );
        return false;
    }
    
    return true;
}

/**
 * Launch camera to take a photo
 */
export async function takePhoto(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
}): Promise<CameraResult | null> {
    try {
        // Request permissions
        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) {
            return null;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: options?.allowsEditing ?? true,
            aspect: options?.aspect ?? [4, 3],
            quality: options?.quality ?? 0.8, // Compress to 80% quality
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        const asset = result.assets[0];
        
        return {
            uri: asset.uri,
            type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
            name: `photo_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
            width: asset.width,
            height: asset.height,
            fileSize: asset.fileSize,
        };
    } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
        return null;
    }
}

/**
 * Pick an image from the gallery
 */
export async function pickImage(options?: {
    allowsEditing?: boolean;
    allowsMultipleSelection?: boolean;
    quality?: number;
}): Promise<CameraResult[] | null> {
    try {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert(
                'Photo Library Permission Required',
                'ALIAS needs access to your photo library. Please enable access in your device settings.'
            );
            return null;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: options?.allowsEditing ?? false,
            allowsMultipleSelection: options?.allowsMultipleSelection ?? true,
            quality: options?.quality ?? 0.8,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        return result.assets.map((asset, index) => ({
            uri: asset.uri,
            type: 'image/jpeg',
            name: `image_${Date.now()}_${index}.jpg`,
            width: asset.width,
            height: asset.height,
            fileSize: asset.fileSize,
        }));
    } catch (error) {
        console.error('Image picker error:', error);
        Alert.alert('Image Picker Error', 'Failed to select image. Please try again.');
        return null;
    }
}

/**
 * Pick a document/file
 */
export async function pickDocument(): Promise<{
    uri: string;
    name: string;
    type: string;
    size: number;
} | null> {
    try {
        // Use expo-document-picker if available
        const DocumentPicker = require('expo-document-picker');
        
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.type === 'cancel' || !result.assets || result.assets.length === 0) {
            return null;
        }

        const asset = result.assets[0];

        return {
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || 'application/octet-stream',
            size: asset.size || 0,
        };
    } catch (error) {
        console.error('Document picker error:', error);
        Alert.alert(
            'Feature Unavailable',
            'Document picking requires expo-document-picker. Install with: npx expo install expo-document-picker'
        );
        return null;
    }
}
