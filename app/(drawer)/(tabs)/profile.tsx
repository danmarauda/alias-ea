import { View, ImageBackground, Text, TouchableOpacity } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { useBusinessMode } from '@/app/contexts/BusinesModeContext';
import Avatar from '@/components/Avatar';
import ListLink from '@/components/ListLink';
import AnimatedView from '@/components/AnimatedView';
import ThemedScroller from '@/components/ThemeScroller';
import { Link } from 'expo-router';
import BusinessSwitch from '@/components/BusinessSwitch';
import React from 'react';


export default function ProfileScreen() {
    const { isBusinessMode } = useBusinessMode();
    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Header title="test" rightComponents={[<HeaderIcon icon="Settings" href="/screens/settings" />]} />
            <View className='flex-1 bg-light-primary dark:bg-dark-primary'>

                <ThemedScroller>

                    <View className="flex-col  items-center justify-center mb-10">
                        <AnimatedView className="" animation='scaleIn' duration={1000}>
                            <Avatar src={require('@/assets/img/thomino.jpg')} size="xxl" />
                        </AnimatedView>
                        <View className="flex-1 mt-4 items-center justify-center">
                            <ThemedText className="text-2xl font-bold">Alex Johnson</ThemedText>
                            <View className='flex flex-row items-center'>
                                <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext ml-2'>alex@gmail.com</ThemedText>
                            </View>
                        </View>

                    </View>

                    {isBusinessMode ? (
                        <>
                            <AnimatedView className='gap-1 px-4' animation='scaleIn'>
                                <ListLink showChevron title="Bookings" description="View your bookings" icon="Calendar" href="/screens/bookings" />
                                <ListLink showChevron title="Analytics" description="View your analytics" icon="ChartBar" href="/(drawer)/(tabs)/analytics" />
                                <ListLink showChevron title="Customers" description="Manage your customers" icon="Users" href="/screens/admin/customers" />
                                <ListLink showChevron title="Your services" description="Manage your services" icon="ShoppingBag" href="/screens/listings" />
                                <ListLink showChevron title="View profile" description="View your profile" icon="User" href="/screens/user-profile" />
                            </AnimatedView>
                        </>
                    ) : (
                        <AnimatedView className='' animation='scaleIn'>
                            <BecomeProvider />
                            <View className='gap-1 px-4'>
                                <ListLink showChevron title="Edit profile" description="Photo, email, password" icon="Edit2" href="/screens/edit-profile" />
                                <ListLink showChevron title="Your bookings" description="View your bookings" icon="Calendar" href="/screens/bookings" />
                                <ListLink showChevron title="Become a provider" description="Become a provider" icon="HandCoins" href="/screens/become-provider" />
                            </View>
                        </AnimatedView>
                    )}

                </ThemedScroller>
                <BusinessSwitch />

            </View>
        </View>
    );
}

export const BecomeProvider = () => {
    return (
        <Link asChild href="/screens/onboarding-start">
            <TouchableOpacity activeOpacity={0.8}>
                <ImageBackground source={require('@/assets/img/banner-2.jpg')} className='w-full object-cover rounded-xl overflow-hidden mb-4'>
                    <View className='w-full p-6'>
                        <Text className='text-xl text-white font-outfit-bold'>Become a provider</Text>
                        <Text className='text-sm text-white'>Onboarding flow screens</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Link>
    );
}