import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import MultiStep, { Step } from '@/components/MultiStep';
import Selectable from '@/components/forms/Selectable';
import ThemedText from '@/components/ThemedText';
import { Chip } from '@/components/Chip';
import Icon, { IconName } from '@/components/Icon';
import { Button } from '@/components/Button';
import useThemeColors from '@/app/contexts/ThemeColors';
import Input from '@/components/forms/Input';
import Section from '@/components/layout/Section';
import * as ImagePicker from 'expo-image-picker';
import ShowRating from '@/components/ShowRating';

interface OnboardingData {
    profession: string;
    availability: string[];
    rateType: string;
    rateAmount: string;
    profileImage?: string;
    coverImage?: string;
    location?: string;
    description?: string;
}

const professionOptions: Array<{ label: string; icon: IconName; value: string }> = [
    { label: 'Web Developer', icon: 'Code', value: 'web' },
    { label: 'Mobile Developer', icon: 'Phone', value: 'mobile' },
    { label: 'UI/UX Designer', icon: 'Palette', value: 'ui-ux' },
    { label: 'Graphic Designer', icon: 'Image', value: 'graphic' },
    { label: 'Logo Designer', icon: 'PenTool', value: 'logo' },
    { label: 'Motion Designer', icon: 'Video', value: 'motion' }
];

const availabilityOptions: Array<{ label: string; icon: IconName }> = [
    { label: 'Full Time', icon: 'Clock' },
    { label: 'Part Time', icon: 'Clock' },
    { label: 'Freelance', icon: 'UserPlus' },
    { label: 'Remote', icon: 'Globe' }
];

const rateTypeOptions: Array<{ label: string; value: string }> = [
    { label: 'Hourly Rate', value: 'hourly' },
    { label: 'Daily Rate', value: 'daily' },
    { label: 'Project Rate', value: 'project' }
];

interface StepProps {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const ProfessionStep: React.FC<StepProps> = ({ data, updateData }) => (
    <ScrollView className="p-4 px-8">
        <View className='mb-10'>
            <ThemedText className='text-3xl font-extrabold mt-auto'>Select your profession</ThemedText>
            <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>What services do you provide?</ThemedText>
        </View>


        {professionOptions.map((option) => (
            <Selectable
                key={option.value}
                title={option.label}
                icon={option.icon}
                selected={data.profession === option.value}
                onPress={() => updateData({ profession: option.value })}
            />
        ))}
    </ScrollView>
);

const AvailabilityStep: React.FC<StepProps> = ({ data, updateData }) => (
    <ScrollView className="p-4 px-8">
        <View className='mb-10'>
            <ThemedText className='text-3xl font-extrabold mt-auto'>Availability</ThemedText>
            <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>Select all that apply</ThemedText>
        </View>

        <View className="flex-col">
            {availabilityOptions.map((option) => (
                <Selectable
                    key={option.label}
                    title={option.label}
                    icon={option.icon}
                    selected={data.availability.includes(option.label)}
                    onPress={() => {
                        const newAvailability = data.availability.includes(option.label)
                            ? data.availability.filter(a => a !== option.label)
                            : [...data.availability, option.label];
                        updateData({ availability: newAvailability });
                    }}
                />
            ))}
        </View>
    </ScrollView>
);

const RatesStep: React.FC<StepProps> = ({ data, updateData }) => {
    return (
        <ScrollView className="p-4 px-8">
            <View className='mb-10'>
                <ThemedText className='text-3xl font-extrabold mt-auto'>What are your rates?</ThemedText>
                <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>How do you charge for your services?</ThemedText>
            </View>

            <Section
                title="Hourly Rate"
                titleSize="md"
                padding="sm"
            >
                <Input
                    rightIcon="DollarSign"
                    containerClassName="mt-1"
                    variant='classic'
                    placeholder="Enter your hourly rate"
                    keyboardType="numeric"
                    value={data.rateType === 'hourly' ? data.rateAmount : ''}
                    onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        updateData({ rateType: 'hourly', rateAmount: numericText });
                    }}
                />
            </Section>

            <Section
                title="Daily Rate"
                titleSize="md"
                padding="sm"
            >
                <Input
                    containerClassName="mt-1"
                    rightIcon="DollarSign"
                    variant='classic'
                    placeholder="Enter your daily rate"
                    keyboardType="numeric"
                    value={data.rateType === 'daily' ? data.rateAmount : ''}
                    onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        updateData({ rateType: 'daily', rateAmount: numericText });
                    }}
                />
            </Section>

            <Section
                title="Project Rate"
                titleSize="md"
                padding="sm"
            >
                <Input
                    rightIcon="DollarSign"
                    containerClassName="mt-1"
                    variant='classic'
                    placeholder="Enter your project rate"
                    keyboardType="numeric"
                    value={data.rateType === 'project' ? data.rateAmount : ''}
                    onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        updateData({ rateType: 'project', rateAmount: numericText });
                    }}
                />
            </Section>
        </ScrollView>
    )
};

const ProfileDetailsStep: React.FC<StepProps> = ({ data, updateData }) => {
    const pickProfileImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            updateData({ profileImage: result.assets[0].uri });
        }
    };

    const pickCoverImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            updateData({ coverImage: result.assets[0].uri });
        }
    };

    return (
        <ScrollView className="p-4 px-8">
            <View className='mb-10'>
                <ThemedText className='text-3xl font-extrabold mt-auto'>Profile Details</ThemedText>
                <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>Add information to complete your profile</ThemedText>
            </View>

            <View className='flex-row items-center justify-between mb-4'>
                <View className="items-center">
                    <TouchableOpacity
                        onPress={pickProfileImage}
                        className="relative"
                        activeOpacity={0.9}
                    >
                        {data.profileImage ? (
                            <Image
                                source={{ uri: data.profileImage }}
                                className="w-24 h-24 rounded-full border border-light-primary dark:border-dark-primary"
                            />
                        ) : (
                            <View className="w-24 h-24 rounded-full bg-light-secondary dark:bg-dark-secondary items-center justify-center">
                                <Icon name="Plus" size={25} className="text-light-subtext dark:text-dark-subtext" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <ThemedText className="mt-2 text-light-subtext dark:text-dark-subtext">
                        Profile picture
                    </ThemedText>
                </View>
                
                <View className="ml-4 flex-1">
                    <TouchableOpacity
                        onPress={pickCoverImage}
                        className="relative w-full"
                        activeOpacity={0.9}
                    >
                        {data.coverImage ? (
                            <Image
                                source={{ uri: data.coverImage }}
                                className="w-full h-24 rounded-lg border border-light-primary dark:border-dark-primary"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-24 rounded-lg bg-light-secondary dark:bg-dark-secondary items-center justify-center">
                                <Icon name="Plus" size={25} className="text-light-subtext dark:text-dark-subtext" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <ThemedText className="mt-2 text-center text-light-subtext dark:text-dark-subtext">
                        Cover photo
                    </ThemedText>
                </View>
            </View>

            <Section 
                title="Location" 
                titleSize="md"
                padding="sm"
                className='mt-0'
            >
                <Input
                    variant='classic'
                    containerClassName="mt-1"
                    rightIcon="MapPin"
                    placeholder="Enter your location"
                    value={data.location}
                    onChangeText={(text) => updateData({ location: text })}
                />
            </Section>

            <Section 
                title="About" 
                titleSize="md"
                padding="sm"
            >
                <Input
                    variant='classic'
                    containerClassName="mt-1"
                    placeholder="Write a brief description about yourself"
                    value={data.description}
                    onChangeText={(text) => updateData({ description: text })}
                    isMultiline={true}
                />
            </Section>
        </ScrollView>
    );
};

const SuccessStep: React.FC<StepProps> = ({ data }) => {
    const colors = useThemeColors();
    
    return (
        <View className="p-8 flex-1">
            <View className="items-center mb-8">
                <ThemedText className="text-2xl font-bold mb-2">Profile Created!</ThemedText>
                <ThemedText className="text-base text-light-subtext dark:text-dark-subtext text-center">
                    Your profile has been created successfully. Here's how it will look:
                </ThemedText>
            </View>
            
            <View className="w-full rounded-xl overflow-hidden bg-light-secondary dark:bg-dark-secondary mb-8">
                {/* Cover Image */}
                {data.coverImage ? (
                    <Image 
                        source={{ uri: data.coverImage }} 
                        className="w-full h-44 rounded-t-xl" 
                        resizeMode="cover"
                    />
                ) : (
                    <Image 
                        source={require('@/assets/img/banner.jpg')} 
                        className="w-full h-44 rounded-t-xl" 
                        resizeMode="cover"
                    />
                )}
                <View className='p-6 pt-0 items-start -mt-10'>
                    {/* Profile Picture */}
                    <View className='rounded-full border-4 border-light-secondary dark:border-dark-secondary'>
                        {data.profileImage ? (
                            <Image 
                                source={{ uri: data.profileImage }} 
                                className="w-16 h-16 rounded-full"
                            />
                        ) : (
                           
                            <Image 
                                source={require('@/assets/img/thomino.jpg')}
                                className="w-16 h-16 rounded-full"
                            />
                        )}
                    </View>
                    
                    <View className='w-full flex-row items-center justify-between'>
                        <ThemedText className='text-base font-semibold mt-2'>Alex Johnson</ThemedText>
                        <ShowRating rating={4.9} />
                    </View>
                    
                    {data.location ? (
                        <View className='w-full flex-row items-center justify-start opacity-50 mt-1'>
                            <Icon name="MapPin" size={12} />
                            <ThemedText className='text-xs ml-1'>{data.location}</ThemedText>
                        </View>
                    ) : (
                        <View className='w-full flex-row items-center justify-start opacity-50 mt-1'>
                            <Icon name="MapPin" size={12} />
                            <ThemedText className='text-xs ml-1'>New York, USA</ThemedText>
                        </View>
                    )}
                    
                   
                    
                    {data.description ? (
                        <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext mt-3'>
                            {data.description}
                        </ThemedText>
                    ) : (
                        <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext mt-3'>
                            Professional with expertise in creating high-quality solutions. Available for projects and collaborations.
                        </ThemedText>
                    )}
                </View>
            </View>
            
        </View>
    );
};

export default function OnboardingScreen() {
    const [data, setData] = useState<OnboardingData>({
        profession: '',
        availability: [],
        rateType: 'hourly',
        rateAmount: '',
        profileImage: '',
        coverImage: '',
        location: '',
        description: '',
    });

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(current => ({ ...current, ...updates }));
    };

    return (
        <MultiStep
            onComplete={() => {
                // Use the theme-aware navigation to prevent flicker
                router.push({
                    pathname: '/screens/user-profile',
                    params: {}
                });
            }}
            onClose={() => router.push('/(drawer)/(tabs)/')}
            showStepIndicator={false}
        >
            <Step title="Profession">
                <ProfessionStep
                    data={data}
                    updateData={updateData}
                />
            </Step>

            <Step title="Availability">
                <AvailabilityStep
                    data={data}
                    updateData={updateData}
                />
            </Step>

            <Step title="Rates">
                <RatesStep
                    data={data}
                    updateData={updateData}
                />
            </Step>

            <Step title="Profile">
                <ProfileDetailsStep
                    data={data}
                    updateData={updateData}
                />
            </Step>

            <Step title="Success">
                <SuccessStep
                    data={data}
                    updateData={updateData}
                />
            </Step>
        </MultiStep>
    );
} 