import { Pressable, Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";
import Icon from "./Icon";
import { shadowPresets } from "@/utils/useShadow";
import AnimatedView from "./AnimatedView";
import { useState, useEffect } from "react";
import Animated, {
    useAnimatedStyle,
    withTiming,
    withSpring,
    useSharedValue,
    interpolate,
    Easing,
    Extrapolation
} from "react-native-reanimated";
import * as ImagePicker from 'expo-image-picker';
import { CardScroller } from "./CardScroller";
import useThemeColors from "@/app/contexts/ThemeColors";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";


type ChatInputProps = {
    onSendMessage?: (text: string, images?: string[]) => void;
};


export const ChatInput = (props: ChatInputProps) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [inputText, setInputText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

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
        if (hasText && !isPlaying) {
            // Hide audio buttons, show send
            audioButtonsVisible.value = withSpring(0, { damping: 90, stiffness: 600 });
            setTimeout(() => {
                sendButtonVisible.value = withSpring(1, { damping: 90, stiffness: 600 });
            }, 100);
        } else if (!hasText && !isPlaying) {
            // Show audio buttons, hide send
            sendButtonVisible.value = withSpring(0, { damping: 90, stiffness: 600 });
            setTimeout(() => {
                audioButtonsVisible.value = withSpring(1, { damping: 90, stiffness: 600 });
            }, 100);
        }
    }, [inputText, isPlaying]);

    // Toggle expand/collapse
    const handleToggle = () => {
        if (isExpanded) {
            // Collapse
            rotation.value = withTiming(0, animConfig);
            attachExpand.value = withTiming(0, animConfig);
            containerScale.value = withTiming(1, animConfig);

            // Fade secondary back in after collapse
            setTimeout(() => {
                secondaryVisible.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
            }, 280);

            setIsExpanded(false);
        } else {
            // Expand: fade out secondary first, then expand with bounce
            secondaryVisible.value = withTiming(0, { duration: 0, easing: Easing.out(Easing.ease) });

            setTimeout(() => {
                rotation.value = withSpring(135, { damping: 90, stiffness: 600 });
                attachExpand.value = withSpring(1, { damping: 80, stiffness: 600 });
                containerScale.value = withSpring(1, { damping: 90, stiffness: 600 });
                // Settle back to 1
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

    // Audio buttons (Mic + AudioLines) style
    const audioButtonsStyle = useAnimatedStyle(() => ({
        opacity: audioButtonsVisible.value,
        transform: [
            { scale: interpolate(audioButtonsVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
        ],
    }));

    // Stop button style
    const stopButtonStyle = useAnimatedStyle(() => ({
        opacity: stopButtonVisible.value,
        transform: [
            { scale: interpolate(stopButtonVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
        ],
    }));

    // Input fade style
    const inputStyle = useAnimatedStyle(() => ({
        opacity: inputVisible.value,
    }));

    // Lottie fade style
    const lottieStyle = useAnimatedStyle(() => ({
        opacity: lottieVisible.value,
    }));

    // Send button style
    const sendButtonStyle = useAnimatedStyle(() => ({
        opacity: sendButtonVisible.value,
        transform: [
            { scale: interpolate(sendButtonVisible.value, [0, 1], [0.5, 1], Extrapolation.CLAMP) },
        ],
    }));

    // Toggle play/stop
    const handlePlayToggle = () => {
        const fadeConfig = { duration: 10, easing: Easing.out(Easing.ease) };

        if (isPlaying) {
            // Show Mic + AudioLines, hide Stop
            stopButtonVisible.value = withSpring(0, { damping: 200, stiffness: 600 });
            lottieVisible.value = withTiming(0, fadeConfig);
            setTimeout(() => {
                audioButtonsVisible.value = withSpring(1, { damping: 200, stiffness: 600 });
                inputVisible.value = withTiming(1, fadeConfig);
            }, 100);
            setIsPlaying(false);
        } else {
            // Hide Mic + AudioLines, show Stop
            audioButtonsVisible.value = withSpring(0, { damping: 100, stiffness: 600 });
            inputVisible.value = withTiming(0, fadeConfig);
            setTimeout(() => {
                stopButtonVisible.value = withSpring(1, { damping: 100, stiffness: 600 });
                lottieVisible.value = withTiming(1, fadeConfig);
            }, 100);
            setIsPlaying(true);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImages(prev => [...prev, result.assets[0].uri]);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSendMessage = () => {
        if (props.onSendMessage && (inputText.trim() || selectedImages.length > 0)) {
            props.onSendMessage(inputText, selectedImages.length > 0 ? selectedImages : undefined);
            setInputText('');
            setSelectedImages([]);
        }
    };

    return (
        <View style={{ paddingBottom: insets.bottom }} className="px-global w-full">
            {selectedImages.length > 0 && (
                <View className="mb-0">
                    <ScrollableImageList
                        images={selectedImages}
                        onRemove={removeImage}
                    />
                </View>
            )}

            <View style={{ ...shadowPresets.card }} className="bg-background rounded-[25px] border border-border">
                <LinearGradient style={{ borderRadius: 25 }} colors={['transparent', 'transparent', 'rgba(255,255,255,0.1)']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                    <View className="relative min-h-[60px]">
                        {/* Lottie waveform */}
                        <Animated.View style={[lottieStyle, { position: 'absolute', width: '100%', height: '100%' }]} pointerEvents={isPlaying ? 'auto' : 'none'}>
                            <LottieView
                                autoPlay
                                loop
                                style={{
                                    width: '100%',
                                    height: 65,
                                    position: 'absolute',
                                    left: 0,
                                    bottom: -12,
                                    zIndex: 40
                                }}
                                source={require('@/assets/lottie/waves.json')}
                            />
                        </Animated.View>

                        {/* Text Input */}
                        <Animated.View style={inputStyle} pointerEvents={isPlaying ? 'none' : 'auto'}>
                            <TextInput
                                placeholder='Ask me anything...'
                                placeholderTextColor={colors.text}
                                className='text-text px-6 py-5'
                                value={inputText}
                                onChangeText={setInputText}
                                style={{ height: 60 }}
                            />
                        </Animated.View>
                    </View>
                    <View className='flex-row justify-between px-4 pt-4 pb-2 rounded-b-3xl'>
                        <View className='flex-row gap-x-2 flex-1 items-center -ml-2'>
                            {/* Expandable container for plus + attachment buttons */}
                            <Animated.View
                                style={[containerStyle]}
                                className={`flex-row p-1.5 items-center border rounded-full gap-3 ${isExpanded ? 'bg-background border-border' : ' border-transparent'}`}
                            >
                                <Pressable onPress={handleToggle} className='items-center justify-center w-10 h-10 rounded-full'>
                                    <Animated.View style={iconStyle}>
                                        <Icon name="Plus" size={20} />
                                    </Animated.View>
                                </Pressable>

                                {/* Attachment buttons */}
                                <Animated.View style={attachButtonStyle}>
                                    <Pressable onPress={pickImage} className='items-center justify-center w-10 h-10 rounded-full'>
                                        <Icon name="Image" size={20} />
                                    </Pressable>
                                </Animated.View>
                                <Animated.View style={attachButtonStyle}>
                                    <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                        <Icon name="Camera" size={20} />
                                    </Pressable>
                                </Animated.View>
                                <Animated.View style={attachButtonStyle}>
                                    <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                        <Icon name="File" size={20} />
                                    </Pressable>
                                </Animated.View>
                            </Animated.View>

                            {/* Globe and Telescope - fade out when expanded */}
                            <Animated.View className="p-1.5" style={secondaryButtonStyle}>
                                <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                    <Icon name='Globe' size={20} />
                                </Pressable>
                            </Animated.View>
                            <Animated.View style={secondaryButtonStyle}>
                                <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                    <Icon name='Telescope' size={20} />
                                </Pressable>
                            </Animated.View>
                        </View>

                        <View className='flex-row gap-x-2 items-center'>
                            {/* Mic + AudioLines - fade out when playing */}
                            <Animated.View style={audioButtonsStyle} className='flex-row gap-x-2'>
                                <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                    <Icon name='Mic' size={20} />
                                </Pressable>
                                <Pressable
                                    onPress={handlePlayToggle}
                                    className='items-center flex justify-center w-10 h-10 bg-primary rounded-full'>
                                    <Icon name='AudioLines' size={18} color={colors.invert} />
                                </Pressable>
                            </Animated.View>

                            {/* Stop button - fade in when playing */}
                            {isPlaying && (
                                <Animated.View style={[stopButtonStyle, { position: 'absolute', right: 0 }]}>
                                    <Pressable
                                        onPress={handlePlayToggle}
                                        className='items-center flex justify-center w-10 h-10 bg-red-500 rounded-full'>
                                        <Icon name='Square' size={16} color="white" fill="white" />
                                    </Pressable>
                                </Animated.View>
                            )}

                            {/* Send button - fade in when typing */}
                            {!isPlaying && (
                                <Animated.View style={[sendButtonStyle, { position: 'absolute', right: 0 }]}>
                                    <Pressable
                                        onPress={handleSendMessage}
                                        className='items-center flex justify-center w-10 h-10 bg-primary rounded-full'>
                                        <Icon name='Send' size={18} color={colors.invert} />
                                    </Pressable>
                                </Animated.View>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}

const ScrollableImageList = ({ images, onRemove }: { images: string[], onRemove: (index: number) => void }) => {
    return (
        <CardScroller className="mb-2 pb-0" space={5}>
            {images.map((uri, index) => (
                <AnimatedView key={`${uri}-${index}`} animation="scaleIn" duration={200} delay={200} className="relative">
                    <Image
                        source={{ uri }}
                        className="w-20 h-20 rounded-2xl"
                    />
                    <Pressable
                        onPress={() => onRemove(index)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full w-6 h-6 items-center justify-center"
                    >
                        <Icon name="X" size={12} color="white" />
                    </Pressable>
                </AnimatedView>
            ))}
        </CardScroller>
    );
};
