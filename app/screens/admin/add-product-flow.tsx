import { Image, Pressable, Text, View, Alert, BackHandler, Easing, StyleSheet, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import useThemeColors from '@/app/contexts/ThemeColors';

import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import { Ionicons } from '@expo/vector-icons';

import ProductVariantCreator from '@/components/ProductVariantCreator';
import { MultipleImagePicker } from '@/components/MultipleImagePicker';
import ThemedText from '@/components/ThemedText';
import ThemedScroller from '@/components/ThemeScroller';
import MultiStep, { Step } from '@/components/MultiStep';
import { Button } from '@/components/Button';


const AddServiceFlow = () => {
    const navigation = useNavigation();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    
    // Define state for form data
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
    
    const handleDeleteProduct = () => {
        Alert.alert(
            "Delete product?",
            "Are you sure you want to delete the product?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Exit", onPress: () => navigation.goBack() },
            ]
        );
    };

    const handleClose = () => {
        Alert.alert(
            "Exit Session",
            "Are you sure you want to go back? Your progress will not be saved.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Exit", onPress: () => navigation.goBack() },
            ]
        );
        return true; // Prevent default back behavior
    };

    const handleComplete = () => {
        console.log("Product Added Successfully");
        navigation.goBack();
    };
    
    const handleStepChange = (nextStep: number) => {
        setCurrentStepIndex(nextStep);
        return true;
    };
    
    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (currentStepIndex > 0) {
                setCurrentStepIndex((prev) => prev - 1);
                return true; // Prevent default back behavior
            } else {
                handleClose();
                return true;
            }
        });
        return () => backHandler.remove();
    }, [currentStepIndex]);

    return (
        <View className='bg-light-primary flex-1 dark:bg-dark-primary'>
            <View className='absolute top-4 left-4 z-10'>
                <Pressable onPress={handleDeleteProduct} className='w-12 h-12 rounded-full items-center justify-center'>
                    <Icon name="Trash2" size={25} />
                </Pressable>
            </View>
            
            <MultiStep
                onComplete={handleComplete}
                onClose={() => navigation.goBack()}
                showHeader={true}
                showStepIndicator={true}
                onStepChange={handleStepChange}
            >
                <Step title="Category">
                    <View className="px-4 pt-6">
                        <Text className='dark:text-white text-2xl font-medium mb-6'>Choose product category</Text>
                        <PickerBox title="Clothing" description="T-shirts, hoodies, jackets, pants" />
                        <PickerBox title="Footwear " description="Sneakers, boots, sandals" />
                        <PickerBox title="Accessories" description="Hats, bags, sunglasses, wallets, belts, jewelry" />
                        <PickerBox title="Other" description="Different product category " />
                    </View>
                </Step>
                
                <Step title="Basic Information">
                    <View className="px-4 pt-6">
                        <ThemedText className='text-2xl font-medium'>Basic information</ThemedText>
                        <ThemedText className='text-light-subtext dark:text-dark-subtext text-sm mb-4'>Describe your product in few words and add photos</ThemedText>

                        <MultipleImagePicker />
                        <View className='mt-6'>
                            <Input  rightIcon='Tag' label="Product name" value={productName} onChangeText={setProductName} />
                            <Select
                                label="Category"
                                options={[
                                    { label: 'Men', value: 'Men' },
                                    { label: 'Women', value: 'Women' },
                                    { label: 'Kids', value: 'Kids' },
                                ]}
                                onChange={() => { }}
                            />
                            <Input isMultiline label="Description" value={description} onChangeText={setDescription} />
                        </View>
                    </View>
                </Step>
                
                <Step title="Pricing">
                    <View className="px-4 pt-6">
                        <ThemedText className='text-2xl font-medium'>Pricing</ThemedText>
                        <ThemedText className='text-light-subtext dark:text-dark-subtext text-sm mb-4'>Set a base price of the product</ThemedText>
                        <Input
                            keyboardType="numeric"
                            label="Base price"
                            value={basePrice}
                            onChangeText={setBasePrice}
                        />
                        <View className='mt-8 flex-row items-center'>
                            <View className='mr-auto'>
                                <ThemedText className=' text-xl font-medium'>Options</ThemedText>
                                <ThemedText className='text-light-subtext dark:text-dark-subtext text-sm  mb-4'>Sizes, colors, duration</ThemedText>
                            </View>
                            <Suggestion isOptions />
                        </View>
                        <ProductVariantCreator hasStock />
                        <View className='h-20 w-full' />
                    </View>
                </Step>
            </MultiStep>
            <Button variant="ghost" title="Delete product" iconStart="Trash2" />
        </View>
    );
}

interface PickerBoxProps {
    title: string;
    description: string;
}

const PickerBox: React.FC<PickerBoxProps> = ({ title, description }) => {
    const [isPressed, setIsPressed] = useState(false);
    return (
        <Pressable
            onPress={() => setIsPressed(!isPressed)}
            className={`w-full p-4 relative items-center flex-row justify-between  rounded-lg border ${isPressed ? ' border-black dark:border-white border-2 mb-[8px]' : 'mb-[10px] border-black/40 dark:border-white/40'}`} // Change the icon name based on the state
        >

            <View>
                <ThemedText className={`text-base font-medium line-clamp-1`}>{title}</ThemedText>
                <ThemedText className={`text-sm `}>{description}</ThemedText>
            </View>

        </Pressable>
    )
}

interface SuggestionProps {
    isOptions?: boolean;
}

export const Suggestion: React.FC<SuggestionProps> = ({ isOptions }) => {
    const colors = useThemeColors();
    const actionSheetRef = useRef<ActionSheetRef>(null);

    const handlePresentModal = () => {
        actionSheetRef.current?.show();
    };

    return (
        <>
            <Pressable onPress={handlePresentModal} className='h-[40px] w-[40px] bg-light-secondary dark:bg-dark-secondary rounded-full flex flex-row items-center justify-center'>
                <Icon name="Search" size={20} />
            </Pressable>
            <ActionSheet
                ref={actionSheetRef}
                containerStyle={{
                    backgroundColor: colors.bg,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20
                }}
            >
                <View className="p-4">
                    <ThemedText className='text-sm font-bold mx-auto mb-4'>Suggestions</ThemedText>
                    <View className='w-full'>
                        {isOptions ? (
                            <>
                                <SuggestionItem hasCheckbox title="Sizes" description="Small, Medium, Large, Extra Large" />
                                <SuggestionItem hasCheckbox title="Colors" description="Black, White, Blue" />
                                <SuggestionItem hasCheckbox title="Duration" description="1 hour, 2 hours, 1 day, 1 week" />
                                <SuggestionItem hasCheckbox title="Number of people" description="1, 2, 3, 4, 5" />
                                <SuggestionItem hasCheckbox title="Type of shooting" description="From water, From beach, Drone" />
                            </>
                        ) : (
                            <>
                                <SuggestionItem title="Beginner Surf Lessons" description="Introduction to surfing basics, including ocean safety, paddling techniques, and standing up on the board." />
                                <SuggestionItem title="Intermediate Surf Lessons" description="Advanced techniques for more experienced surfers, such as turning, wave selection, and improving overall surfing skills." />
                                <SuggestionItem title="Group Surf Lessons" description="Lessons for small groups, often friends or family, providing a more social learning experience." />
                                <SuggestionItem title="Kids' Surf Lessons" description="Specialized instruction for children, focusing on safety, fun, and building confidence in the water." />
                                <SuggestionItem title="Video Analysis" description="Using video recordings of the student's surfing sessions to analyze and provide detailed feedback on technique and areas for improvement." />
                                <SuggestionItem title="Drone Footage" description="Aerial shots and videos of surfers and surf spots, providing a unique perspective that captures the scale and beauty of the surf environment." />
                                <SuggestionItem title="Session Photo Packages" description="Offering packages that include a set number of photos or a video of a surfer's session, often tailored to individual surfers or groups." />
                                <SuggestionItem title="Surf Trip Documentation" description="Providing comprehensive photo and video coverage of surf trips, including travel, lifestyle, and surfing action, to create memorable keepsakes." />
                            </>
                        )}
                    </View>
                </View>
            </ActionSheet>
        </>
    )
}

interface SuggestionItemProps {
    title: string;
    description: string;
    hasCheckbox?: boolean;
}

export const SuggestionItem: React.FC<SuggestionItemProps> = ({ title, description, hasCheckbox }) => {
    return (
        <Pressable onPress={() => {}} className='py-5 border-b border-light-secondary dark:border-dark-secondary flex flex-row items-center'>
            <View className='flex-1 pr-4'>
                <ThemedText className='text-base font-semibold'>{title}</ThemedText>
                <ThemedText numberOfLines={1} className='text-xs text-light-subtext dark:text-dark-subtext'>{description}</ThemedText>
            </View>
           
        </Pressable>
    )
}

export default AddServiceFlow;