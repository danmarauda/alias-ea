import { Pressable, Image, Platform, KeyboardAvoidingView, Keyboard, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, ScrollView } from "react-native-gesture-handler";
import { View } from "react-native";
import Icon, { IconName } from "./Icon";
import { shadowPresets } from "@/utils/useShadow";
import ThemedText from "./ThemedText";
import AnimatedView from "./AnimatedView";
import { useState, useEffect, useRef } from "react";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import * as ImagePicker from 'expo-image-picker';
import { CardScroller } from "./CardScroller";


type ChatInputProps = {
    attachVisible?: boolean;
    setAttachVisible?: (visible: boolean) => void;
    onSendMessage?: (text: string, images?: string[]) => void;
};


export const ChatInput = (props: ChatInputProps) => {
    const insets = useSafeAreaInsets();
    // Add internal state to handle toggle independently
    const [isAttachVisible, setIsAttachVisible] = useState(props.attachVisible || false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const rotation = useSharedValue(0);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [inputText, setInputText] = useState('');
    const [inputHeight, setInputHeight] = useState(40); // Initial height that works better
    
    // Maximum height corresponds to 5 lines of text (approximately)
    const MAX_INPUT_HEIGHT = 120;
    
    // Monitor keyboard visibility
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setIsKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);
    
    // Keep internal state in sync with props
    useEffect(() => {
        if (props.attachVisible !== undefined) {
            setIsAttachVisible(props.attachVisible);
        }
    }, [props.attachVisible]);
    
    // Function to handle toggling
    const handleToggle = () => {
        if (isAttachVisible) {
            // Start exit animation
            setIsAnimatingOut(true);
            // Rotate icon back to 0 degrees
            rotation.value = withTiming(0, { duration: 250 });
            // After animation completes, actually hide the component
            setTimeout(() => {
                setIsAttachVisible(false);
                setIsAnimatingOut(false);
            }, 300); // Animation duration + a little buffer
        } else {
            // Show immediately
            setIsAttachVisible(true);
            setIsAnimatingOut(false);
            // Rotate icon to 45 degrees
            rotation.value = withTiming(135, { duration: 350 });
        }
        
        // Call parent handler
        props.setAttachVisible?.(!isAttachVisible);
    };
    
    const iconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });
    
    const pickImage = async () => {
        // When Image button is clicked, add a delay before closing the menu
        setTimeout(() => {
            // Close the picker menu and animate the icon back
            setIsAnimatingOut(true);
            rotation.value = withTiming(0, { duration: 250 });
            
            // After animation completes, actually hide the component
            setTimeout(() => {
                setIsAttachVisible(false);
                setIsAnimatingOut(false);
            }, 300);
            
            // Call parent handler if needed
            props.setAttachVisible?.(false);
        }, 500); // Add 500ms delay before starting to hide
        
        // Ask for permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }
        
        // No editing, only one image at a time, in original quality
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });
        
        // If not cancelled and has assets
        if (!result.canceled && result.assets && result.assets.length > 0) {
            // Add the new image uri to the selectedImages array
            setSelectedImages(prev => [...prev, result.assets[0].uri]);
        }
    };
    
    const removeImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    // Handle content size change
    const handleContentSizeChange = (event: any) => {
        const contentHeight = Math.max(40, Math.min(event.nativeEvent.contentSize.height, MAX_INPUT_HEIGHT));
        setInputHeight(contentHeight);
    };
    
    // Handle message send
    const handleSendMessage = () => {
        if (props.onSendMessage && (inputText.trim() || selectedImages.length > 0)) {
            props.onSendMessage(inputText, selectedImages.length > 0 ? selectedImages : undefined);
            setInputText('');
            setSelectedImages([]);
        }
    };
    
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            //keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            //style={{ width: '100%' }}
        >
            <View className="px-2 w-full absolute bottom-0"  >
                {selectedImages.length > 0 && (
                    <View className="mb-0">
                        <ScrollableImageList 
                            images={selectedImages} 
                            onRemove={removeImage} 
                        />
                    </View>
                )}
                
                {/**add seected images here */}
                {(isAttachVisible || isAnimatingOut) && (
                    <View className="flex-row w-full mb-2">
                        <AnimatedPickerItem 
                            icon="Image" 
                            label="Image" 
                            delay={0} 
                            isExiting={isAnimatingOut}
                            onPress={pickImage}
                        />
                        
                        <AnimatedPickerItem 
                            icon="Camera" 
                            label="Camera" 
                            delay={40} 
                            isExiting={isAnimatingOut}
                        />
                        
                        <AnimatedPickerItem 
                            icon="File" 
                            label="File" 
                            delay={80} 
                            isExiting={isAnimatingOut}
                        />
                    </View>
                )}
                <View style={{ ...shadowPresets.large }} className={` bg-light-secondary  dark:bg-dark-secondary rounded-3xl `}>
                    <TextInput
                        placeholder='Ask me anything...'
                        placeholderTextColor="white"
                        className='text-black dark:text-white px-6 py-5'
                        value={inputText}
                        onChangeText={setInputText}
                        multiline={true}
                        style={{ 
                            minHeight: 40, 
                            maxHeight: MAX_INPUT_HEIGHT,
                            height: inputHeight,
                        }}
                        onContentSizeChange={handleContentSizeChange}
                    />
                    <View className='flex-row bg-black/10 dark:bg-black/30 justify-between p-2 rounded-b-3xl'>
                        <View className='flex-row gap-x-2'>
                            <Pressable onPress={handleToggle} className='items-center justify-center w-10 h-10 rounded-full'>
                                <Animated.View style={iconStyle}>
                                    <Icon name="Plus" size={18} />
                                </Animated.View>
                            </Pressable>
                            <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                <Icon name='Globe' size={18} />
                            </Pressable>
                            <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                <Icon name='Telescope' size={18} />
                            </Pressable>
                        </View>
                        <View className='flex-row gap-x-2'>
                            <Pressable className='items-center justify-center w-10 h-10 rounded-full'>
                                <Icon name='Mic' size={18} />
                            </Pressable>
                            <Pressable 
                                onPress={handleSendMessage}
                                className='items-center justify-center w-10 h-10 bg-dark-primary dark:bg-white rounded-full'>
                                <Icon name='ArrowUp' size={22} color="black" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const ScrollableImageList = ({ images, onRemove }: { images: string[], onRemove: (index: number) => void }) => {
    return (
        <CardScroller className="mb-1 pb-0" space={5}>
            {images.map((uri, index) => (
                <AnimatedView key={`${uri}-${index}`} animation="scaleIn" duration={200} delay={200} className="relative">
                    <Image
                        source={{ uri }}
                        className="w-20 h-20 rounded-xl"
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

const AnimatedPickerItem = (props: { 
    icon: IconName; 
    label: string; 
    delay: number; 
    isExiting: boolean;
    onPress?: () => void;
}) => {
    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);
    
    // Run animation whenever the component mounts or the isExiting prop changes
    useEffect(() => {
        if (props.isExiting) {
            // Exit animation with delay
            setTimeout(() => {
                translateY.value = withTiming(50, { duration: 200 });
                opacity.value = withTiming(0, { duration: 200 });
            }, props.delay);
        } else {
            // Entry animation with delay
            setTimeout(() => {
                translateY.value = withTiming(0, { duration: 200 });
                opacity.value = withTiming(1, { duration: 200 });
            }, props.delay);
        }
    }, [props.isExiting, props.delay]);
    
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value
        };
    });
    
    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity 
                style={{ ...shadowPresets.large }} 
                className='items-center mr-2 justify-center rounded-2xl flex-row p-4 bg-light-secondary dark:bg-dark-secondary'
                onPress={props.onPress}
            >
                <Icon name={props.icon} size={18} />
                <ThemedText className="ml-2">{props.label}</ThemedText>
            </TouchableOpacity>
        </Animated.View>
    );
}
