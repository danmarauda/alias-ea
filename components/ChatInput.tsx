import { Pressable, View, Alert, Text, Platform, Dimensions, Keyboard } from "react-native";
import { Image } from 'expo-image';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";
import Icon from "./Icon";
import { shadowPresets } from "@/utils/useShadow";
import AnimatedView from "./AnimatedView";
import { useState, useEffect, useRef, useCallback } from "react";
import Animated, {
    useAnimatedStyle,
    withTiming,
    withSpring,
    useSharedValue,
    interpolate,
    Easing,
    Extrapolation,
    Keyframe,
} from "react-native-reanimated";
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerAsset } from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { CardScroller } from "./CardScroller";
import useThemeColors from "@/app/contexts/ThemeColors";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useRecording } from "@/hooks/useRecording";
import { ShimmerText } from "./ShimmerText";
import { CameraCapture } from "./CameraCapture";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from 'expo-file-system';

// Exit animation for image removal
const imageExitAnimation = new Keyframe({
    0: { opacity: 1, transform: [{ scale: 1 }] },
    100: { opacity: 0, transform: [{ scale: 0.8 }] },
}).duration(120);

type ChatInputProps = {
    onSendMessage?: (text: string, images?: string[], mode?: 'chat' | 'web-search' | 'deep-research') => void;
};

export const ChatInput = (props: ChatInputProps) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<Array<{ uri: string; name: string; mimeType: string }>>([]);
    const [inputText, setInputText] = useState('');
    const [isRecordingUI, setIsRecordingUI] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const lottieRef = useRef<LottieView>(null);
    const inputRef = useRef<any>(null);

    // Android focus animation values
    const androidFocusProgress = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);

    // Listen for keyboard show/hide on Android
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
            overlayOpacity.value = withTiming(1, { duration: 200 });
            androidFocusProgress.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
        });

        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
            androidFocusProgress.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) });
            overlayOpacity.value = withTiming(0, { duration: 200 });
        });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    // Recording hook
    const { isTranscribing, startRecording, stopRecording, transcribeAudio } = useRecording();

    // Animation shared values
    const rotation = useSharedValue(0);
    const attachExpand = useSharedValue(0);
    const secondaryVisible = useSharedValue(1);
    const containerScale = useSharedValue(1);
    const audioButtonsVisible = useSharedValue(1);
    const stopButtonVisible = useSharedValue(0);
    const inputVisible = useSharedValue(1);
    const lottieVisible = useSharedValue(0);
    const sendButtonVisible = useSharedValue(0);

    // Animation config
    const animConfig = {
        duration: 280,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    };

    // Watch for text input changes to show/hide send button
    useEffect(() => {
        const hasText = inputText.trim().length > 0;
        const hasContent = hasText || selectedImages.length > 0 || selectedFiles.length > 0;
        
        if (hasContent && !isRecordingUI) {
            audioButtonsVisible.value = withSpring(0, { damping: 90, stiffness: 600 });
            setTimeout(() => {
                sendButtonVisible.value = withSpring(1, { damping: 90, stiffness: 600 });
            }, 100);
        } else if (!hasContent && !isRecordingUI) {
            sendButtonVisible.value = withSpring(0, { damping: 90, stiffness: 600 });
            setTimeout(() => {
                audioButtonsVisible.value = withSpring(1, { damping: 90, stiffness: 600 });
            }, 100);
        }
    }, [inputText, isRecordingUI, selectedImages.length, selectedFiles.length]);

    // Toggle expand/collapse
    const handleToggle = () => {
        if (isExpanded) {
            rotation.value = withTiming(0, animConfig);
            attachExpand.value = withTiming(0, animConfig);
            containerScale.value = withTiming(1, animConfig);
            setTimeout(() => {
                secondaryVisible.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
            }, 280);
            setIsExpanded(false);
        } else {
            secondaryVisible.value = withTiming(0, { duration: 0, easing: Easing.out(Easing.ease) });
            setTimeout(() => {
                rotation.value = withSpring(135, { damping: 90, stiffness: 600 });
                attachExpand.value = withSpring(1, { damping: 80, stiffness: 600 });
                containerScale.value = withSpring(1, { damping: 90, stiffness: 600 });
                setTimeout(() => {
                    containerScale.value = withSpring(1, { damping: 90, stiffness: 600 });
                }, 150);
            }, 0);
            setIsExpanded(true);
        }
    };

    // Animated styles
    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    const containerStyle = useAnimatedStyle(() => {
        const width = interpolate(
            attachExpand.value,
            [0, 1],
            [40, 189],
            Extrapolation.CLAMP
        );
        return {
            width,
            overflow: 'hidden' as const,
            transform: [{ scale: containerScale.value }],
        };
    });

    const attachButtonStyle = useAnimatedStyle(() => ({
        opacity: attachExpand.value,
        transform: [
            { scale: interpolate(attachExpand.value, [0, 1], [0.5, 1], Extrapolation.CLAMP) },
        ],
    }));

    const secondaryButtonStyle = useAnimatedStyle(() => ({
        opacity: secondaryVisible.value,
        transform: [
            { scale: interpolate(secondaryVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
        ],
    }));

    const audioButtonsStyle = useAnimatedStyle(() => ({
        opacity: audioButtonsVisible.value,
        transform: [
            { scale: interpolate(audioButtonsVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
        ],
    }));

    const stopButtonStyle = useAnimatedStyle(() => ({
        opacity: stopButtonVisible.value,
        transform: [
            { scale: interpolate(stopButtonVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
        ],
    }));

    const inputStyle = useAnimatedStyle(() => ({ opacity: inputVisible.value }));
    const lottieStyle = useAnimatedStyle(() => ({ opacity: lottieVisible.value }));

    const sendButtonStyle = useAnimatedStyle(() => ({
        opacity: sendButtonVisible.value,
        transform: [
            { scale: interpolate(sendButtonVisible.value, [0, 1], [0.5, 1], Extrapolation.CLAMP) },
        ],
    }));

    const androidOverlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
        pointerEvents: overlayOpacity.value > 0 ? 'auto' as const : 'none' as const,
    }));

    const screenHeight = Dimensions.get('window').height;
    const androidInputStyle = useAnimatedStyle(() => {
        if (Platform.OS !== 'android') return {};
        const translateY = interpolate(
            androidFocusProgress.value,
            [0, 1],
            [0, -(screenHeight * 0.35)],
            Extrapolation.CLAMP
        );
        return { transform: [{ translateY }] };
    });

    const handleOverlayPress = () => Keyboard.dismiss();

    // Start recording
    const handleStartRecording = async () => {
        const fadeConfig = { duration: 10, easing: Easing.out(Easing.ease) };
        try {
            await startRecording();
            audioButtonsVisible.value = withSpring(0, { damping: 100, stiffness: 600 });
            inputVisible.value = withTiming(0, fadeConfig);
            setTimeout(() => {
                stopButtonVisible.value = withSpring(1, { damping: 100, stiffness: 600 });
                lottieVisible.value = withTiming(1, fadeConfig);
            }, 100);
            setIsRecordingUI(true);
        } catch (error) {
            Alert.alert('Error', 'Could not start recording. Please check microphone permissions.');
        }
    };

    // Stop recording and transcribe
    const handleStopRecording = async () => {
        const fadeConfig = { duration: 10, easing: Easing.out(Easing.ease) };
        stopButtonVisible.value = withSpring(0, { damping: 200, stiffness: 600 });
        lottieVisible.value = withTiming(0, fadeConfig);
        setTimeout(() => {
            audioButtonsVisible.value = withSpring(1, { damping: 200, stiffness: 600 });
            inputVisible.value = withTiming(1, fadeConfig);
        }, 100);
        setIsRecordingUI(false);

        try {
            const audioUri = await stopRecording();
            if (audioUri) {
                const transcription = await transcribeAudio(audioUri);
                setInputText(prev => prev ? `${prev} ${transcription}` : transcription);
            }
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Transcription failed');
        }
    };

    // Optimize image before adding
    const optimizeImage = async (uri: string): Promise<string> => {
        try {
            setIsProcessing(true);
            const manipulated = await manipulateAsync(
                uri,
                [{ resize: { width: 1200 } }],
                { compress: 0.8, format: SaveFormat.JPEG }
            );
            return manipulated.uri;
        } catch (error) {
            console.error('Image optimization error:', error);
            return uri;
        } finally {
            setIsProcessing(false);
        }
    };

    // Get file size for display
    const getFileSize = async (uri: string): Promise<string> => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) return 'Unknown size';
            
            const bytes = fileInfo.size;
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        } catch {
            return 'Unknown size';
        }
    };

    // Pick image from gallery
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera roll access is needed to select photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: 5,
        });

        if (!result.canceled && result.assets) {
            const optimizedUris = await Promise.all(
                result.assets.map(asset => optimizeImage(asset.uri))
            );
            setSelectedImages(prev => [...prev, ...optimizedUris]);
        }
    };

    // Open camera
    const openCamera = () => {
        setIsCameraVisible(true);
        setIsExpanded(false);
        rotation.value = withTiming(0, animConfig);
        attachExpand.value = withTiming(0, animConfig);
        secondaryVisible.value = withTiming(1, { duration: 200 });
    };

    // Handle camera capture
    const handleCameraCapture = (uri: string) => {
        setSelectedImages(prev => [...prev, uri]);
    };

    // Pick file/document
    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['*/*'],
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets) {
                const newFiles = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType || 'application/octet-stream',
                }));
                setSelectedFiles(prev => [...prev, ...newFiles]);
            }
        } catch (error) {
            console.error('File picker error:', error);
            Alert.alert('Error', 'Could not select file. Please try again.');
        }
    };

    // Web search
    const handleWebSearch = () => {
        if (inputText.trim()) {
            props.onSendMessage?.(inputText, undefined, 'web-search');
            setInputText('');
        } else {
            Alert.alert('Enter a Query', 'Please type something to search the web.');
        }
    };

    // Deep research
    const handleDeepResearch = () => {
        if (inputText.trim()) {
            props.onSendMessage?.(inputText, undefined, 'deep-research');
            setInputText('');
        } else {
            Alert.alert('Enter a Topic', 'Please type a topic to research deeply.');
        }
    };

    const removeImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSendMessage = () => {
        const hasContent = inputText.trim() || selectedImages.length > 0 || selectedFiles.length > 0;
        if (props.onSendMessage && hasContent) {
            props.onSendMessage(
                inputText,
                selectedImages.length > 0 ? selectedImages : undefined
            );
            setInputText('');
            setSelectedImages([]);
            setSelectedFiles([]);
        }
    };

    return (
        <>
            {/* Camera Capture Modal */}
            <CameraCapture
                isVisible={isCameraVisible}
                onClose={() => setIsCameraVisible(false)}
                onCapture={handleCameraCapture}
            />

            {/* Processing Indicator */}
            {isProcessing && (
                <View className="absolute top-0 left-0 right-0 items-center justify-center z-50" style={{ paddingTop: 100 }}>
                    <View className="bg-black/70 px-4 py-2 rounded-full flex-row items-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white ml-2 text-sm">Optimizing...</Text>
                    </View>
                </View>
            )}

            {/* Android overlay when focused */}
            {Platform.OS === 'android' && (
                <Animated.View
                    style={[androidOverlayStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0)', zIndex: 998 }]}
                >
                    <Pressable style={{ flex: 1 }} onPress={handleOverlayPress} />
                </Animated.View>
            )}

            <Animated.View
                style={[
                    { paddingBottom: insets.bottom + 0, zIndex: 999 },
                    Platform.OS === 'android' ? androidInputStyle : {}
                ]}
                className="px-global w-full absolute bottom-0 left-0 right-0"
            >
                {/* Selected Images */}
                {selectedImages.length > 0 && (
                    <View className="mb-2">
                        <ScrollableImageList images={selectedImages} onRemove={removeImage} />
                    </View>
                )}

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <View className="mb-2">
                        <ScrollableFileList files={selectedFiles} onRemove={removeFile} />
                    </View>
                )}

                <View style={{ ...shadowPresets.card }} className="bg-background rounded-[25px] border border-border">
                    <LinearGradient style={{ borderRadius: 25 }} colors={['transparent', 'transparent', 'rgba(255,255,255,0.1)']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                        <View className="relative min-h-[60px]">
                            <Animated.View style={[lottieStyle, { position: 'absolute', width: '100%', height: '100%' }]} pointerEvents={isRecordingUI ? 'auto' : 'none'}>
                                <LottieView
                                    ref={lottieRef}
                                    autoPlay
                                    loop
                                    style={{ width: '100%', height: 65, position: 'absolute', left: 0, bottom: -12, zIndex: 40 }}
                                    source={require('@/assets/lottie/waves.json')}
                                />
                            </Animated.View>

                            <Animated.View style={inputStyle} pointerEvents={isRecordingUI ? 'none' : 'auto'}>
                                {isTranscribing ? (
                                    <View className="px-6 py-5" style={{ minHeight: 60, justifyContent: 'center' }}>
                                        <ShimmerText text="Transcribing..." className="text-base text-text" />
                                    </View>
                                ) : (
                                    <TextInput
                                        ref={inputRef}
                                        placeholder="Ask me anything..."
                                        placeholderTextColor={colors.placeholder}
                                        className='text-text px-6 py-5'
                                        value={inputText}
                                        onChangeText={setInputText}
                                        style={{ minHeight: 60 }}
                                        multiline={true}
                                        accessibilityLabel="Message input"
                                        accessibilityHint="Type your message here"
                                        accessibilityRole="text"
                                    />
                                )}
                            </Animated.View>
                        </View>

                        <View className='flex-row justify-between px-4 pt-4 pb-2 rounded-b-3xl'>
                            <View className='flex-row gap-x-2 flex-1 items-center -ml-2'>
                                <Animated.View style={[containerStyle]} className={`flex-row p-1.5 items-center border rounded-full gap-3 ${isExpanded ? 'bg-background border-border' : ' border-transparent'}`}>
                                    <Pressable onPress={handleToggle} className='items-center justify-center w-10 h-10 rounded-full' accessibilityLabel={isExpanded ? "Close menu" : "Open menu"} accessibilityRole="button">
                                        <Animated.View style={iconStyle}>
                                            <Icon name="Plus" size={20} />
                                        </Animated.View>
                                    </Pressable>

                                    <Animated.View style={attachButtonStyle}>
                                        <Pressable onPress={pickImage} className='items-center justify-center w-10 h-10 rounded-full active:opacity-70' accessibilityLabel="Add image from gallery" accessibilityHint="Double tap to select images" accessibilityRole="button">
                                            <Icon name="Image" size={20} />
                                        </Pressable>
                                    </Animated.View>
                                    <Animated.View style={attachButtonStyle}>
                                        <Pressable onPress={openCamera} className='items-center justify-center w-10 h-10 rounded-full active:opacity-70' accessibilityLabel="Take photo with camera" accessibilityHint="Double tap to open camera" accessibilityRole="button">
                                            <Icon name="Camera" size={20} />
                                        </Pressable>
                                    </Animated.View>
                                    <Animated.View style={attachButtonStyle}>
                                        <Pressable onPress={pickFile} className='items-center justify-center w-10 h-10 rounded-full active:opacity-70' accessibilityLabel="Attach file" accessibilityHint="Double tap to attach a file" accessibilityRole="button">
                                            <Icon name="File" size={20} />
                                        </Pressable>
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View className="p-1.5" style={secondaryButtonStyle}>
                                    <Pressable onPress={handleWebSearch} className='items-center justify-center w-10 h-10 rounded-full active:opacity-70' accessibilityLabel="Web search" accessibilityHint="Double tap to search the web" accessibilityRole="button">
                                        <Icon name='Globe' size={20} />
                                    </Pressable>
                                </Animated.View>
                                <Animated.View style={secondaryButtonStyle}>
                                    <Pressable onPress={handleDeepResearch} className='items-center justify-center w-10 h-10 rounded-full active:opacity-70' accessibilityLabel="Deep research" accessibilityHint="Double tap for deep research" accessibilityRole="button">
                                        <Icon name='Telescope' size={20} />
                                    </Pressable>
                                </Animated.View>
                            </View>

                            <View className='flex-row gap-x-2 items-center'>
                                <Animated.View style={audioButtonsStyle} className='flex-row gap-x-2'>
                                    <Pressable onPress={handleStartRecording} className='items-center justify-center w-10 h-10 rounded-full active:opacity-70' accessibilityLabel="Start voice recording" accessibilityHint="Double tap to record voice" accessibilityRole="button">
                                        <Icon name='Mic' size={20} />
                                    </Pressable>
                                    <Pressable onPress={handleStartRecording} className='items-center flex justify-center w-10 h-10 bg-primary rounded-full active:opacity-80' accessibilityLabel="Quick voice input" accessibilityRole="button">
                                        <Icon name='AudioLines' size={18} color={colors.invert} />
                                    </Pressable>
                                </Animated.View>

                                {isRecordingUI && (
                                    <Animated.View style={[stopButtonStyle, { position: 'absolute', right: 0 }]}>
                                        <Pressable onPress={handleStopRecording} className='items-center flex-row justify-center h-10 px-4 bg-sky-500 rounded-full gap-2 active:opacity-80' accessibilityLabel="Stop recording" accessibilityRole="button">
                                            <Icon name='Check' size={12} color="white" />
                                            <Text className='text-white font-semibold text-sm'>Done</Text>
                                        </Pressable>
                                    </Animated.View>
                                )}

                                {!isRecordingUI && (
                                    <Animated.View style={[sendButtonStyle, { position: 'absolute', right: 0 }]}>
                                        <Pressable onPress={handleSendMessage} className='items-center flex justify-center w-10 h-10 bg-primary rounded-full active:opacity-80' accessibilityLabel="Send message" accessibilityRole="button" disabled={!inputText.trim() && selectedImages.length === 0 && selectedFiles.length === 0}>
                                            <Icon name='Send' size={18} color={colors.invert} />
                                        </Pressable>
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            </Animated.View>
        </>
    );
};

const ScrollableImageList = ({ images, onRemove }: { images: string[], onRemove: (index: number) => void }) => (
    <CardScroller className="mb-2 pb-0" space={5}>
        {images.map((uri, index) => (
            <Animated.View key={`${uri}-${index}`} exiting={imageExitAnimation} className="relative">
                <AnimatedView animation="scaleIn" duration={200} delay={200}>
                    <Image source={{ uri }} className="w-20 h-20 rounded-2xl" contentFit="cover" />
                    <Pressable onPress={() => onRemove(index)} className="absolute top-1 right-1 bg-black/50 rounded-full w-6 h-6 items-center justify-center active:opacity-70" accessibilityLabel="Remove image" accessibilityRole="button">
                        <Icon name="X" size={12} color="white" />
                    </Pressable>
                </AnimatedView>
            </Animated.View>
        ))}
    </CardScroller>
);

const ScrollableFileList = ({ files, onRemove }: { files: Array<{ uri: string; name: string; mimeType: string }>, onRemove: (index: number) => void }) => (
    <CardScroller className="mb-2 pb-0" space={5}>
        {files.map((file, index) => (
            <Animated.View key={`${file.uri}-${index}`} entering={FadeIn} exiting={FadeOut} className="relative">
                <View className="w-20 h-20 rounded-2xl bg-secondary border border-border items-center justify-center p-2">
                    <Icon name="FileText" size={24} />
                    <Text numberOfLines={1} className="text-xs text-text mt-1 w-full text-center">{file.name}</Text>
                </View>
                <Pressable onPress={() => onRemove(index)} className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center active:opacity-70" accessibilityLabel="Remove file" accessibilityRole="button">
                    <Icon name="X" size={10} color="white" />
                </Pressable>
            </Animated.View>
        ))}
    </CardScroller>
);

import { FadeIn, FadeOut } from "react-native-reanimated";
import { ActivityIndicator } from "react-native";
