import { Link, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import ThemedText from './ThemedText';
import Icon, { IconName } from './Icon';
import Avatar from './Avatar';
import { SearchPressable } from '@/app/(drawer)/(tabs)/index';
import ThemeToggle from '@/components/ThemeToggle';
import ThemedScroller from './ThemeScroller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


    export default function CustomDrawerContent() {
    const insets = useSafeAreaInsets();
    return (
        <ThemedScroller className="flex-1 p-8 bg-white dark:bg-dark-primary" style={{ paddingTop: insets.top }}>

            <ThemedText className='text-2xl font-outfit-bold mb-4    mt-4'>Multia<Text className="text-highlight">.</Text></ThemedText>
            <SearchPressable />

            <View className='flex-col pb-6 mb-6 mt-10 border-b border-light-secondary dark:border-dark-secondary'>
                <NavItem href="/screens/profile" icon="User" label="Profile" />
                <NavItem href="/screens/orders" icon="Package" label="Orders" />
                <NavItem href="/screens/admin" icon="Contact" label="Admin" />
                <NavItem href="/screens/onboarding-start" icon="Lightbulb" label="Onboarding" />
                <NavItem href="/screens/welcome" icon="Package" label="Welcome" />
                <NavItem href="/screens/notification-permission" icon="ShieldCheck" label="Permissions" />
                <NavItem href="/screens/chat/list" icon="MessageCircle" label="Chat" />
                <NavItem href="/screens/login" icon="ArrowLeft" label="Sign out" />

            </View>
            <View className='flex-row justify-between items-center'>    
                <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext'>Version 1.0.0</ThemedText>
                <ThemeToggle />
            </View>

        </ThemedScroller>
    );
}

type NavItemProps = {
    href: string;
    icon: IconName;
    label: string;
    className?: string;
    description?: string;
};

export const NavItem = ({ href, icon, label, description }: NavItemProps) => (

    <TouchableOpacity onPress={() => router.push(href)} className={`flex-row items-center py-3`}>
        <View className='flex-row items-center justify-center w-10 h-10 bg-light-secondary dark:bg-dark-secondary rounded-xl'>
            <Icon name={icon} size={18} className='' />
        </View>
        <View className='flex-1 ml-4 '>
            {label &&
                <ThemedText className="text-lg font-bold text-gray-800 dark:text-gray-200">{label}</ThemedText>
            }
            {description &&
                <ThemedText className='opacity-50 text-xs'>{description}</ThemedText>
            }
        </View>

    </TouchableOpacity>

);


