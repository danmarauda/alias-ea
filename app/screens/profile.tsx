import { View, Image, ScrollView, Alert, Pressable } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import Avatar from '@/components/Avatar';
import ListLink from '@/components/ListLink';
import AnimatedView from '@/components/AnimatedView';
import ThemedScroller from '@/components/ThemeScroller';
import { shadowPresets } from '@/utils/useShadow';
import { useAuth } from '@/app/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const { user, logout, isLoading } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace('/screens/welcome');
                        } catch (err) {
                            Alert.alert('Error', 'Failed to log out. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // Use real user data or fallback to defaults
    const displayName = user?.name || 'Guest User';
    const displayEmail = user?.email || 'guest@example.com';
    const avatarSource = user?.avatarUrl 
        ? { uri: user.avatarUrl } 
        : require('@/assets/img/thomino.jpg');

    return (
        <AnimatedView className='flex-1 bg-background' animation='fadeIn' duration={350} playOnlyOnce={false}>
            <Header showBackButton title="Profile" />
            <ThemedScroller className='!px-10'>
                <View className=" px-6 py-10 w-full border border-border rounded-3xl mb-4">
                    <View className="flex-col justify-center items-center">
                        <Avatar src={avatarSource} size="xl" />
                        <View className="items-center flex-1 mt-3">
                            <ThemedText className="text-2xl font-bold">{displayName}</ThemedText>
                            <View className='flex flex-row items-center'>
                                <ThemedText className='text-sm text-subtext'>{displayEmail}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={shadowPresets.medium} className='bg-secondary rounded-3xl  '>
                    <ListLink className='px-5' hasBorder title="Settings" icon="Settings" href="/screens/edit-profile" />
                    <ListLink className='px-5' hasBorder title="Upgrade to plus" icon="MapPin" href="/screens/subscription" />
                    <ListLink className='px-5' hasBorder title="Ai Voice" icon="MicVocal" href="/screens/ai-voice" />
                    <ListLink className='px-5' hasBorder title="Help" icon="HelpCircle" href="/screens/help" />
                    
                    {/* Logout button with confirmation */}
                    <Pressable 
                        onPress={handleLogout}
                        disabled={isLoading}
                        className='flex-row items-center px-5 py-4 active:opacity-60'
                        accessibilityLabel="Logout"
                        accessibilityHint="Double tap to log out of your account"
                        accessibilityRole="button"
                    >
                        <ListLink className='px-0 flex-1' title="Logout" icon="LogOut" href={null as any} />
                    </Pressable>
                </View>
            </ThemedScroller>
        </AnimatedView>
    );
}
