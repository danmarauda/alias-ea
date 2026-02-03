import { Link, router } from 'expo-router';
import { View, TouchableOpacity, TextInput, Touchable, FlatList } from 'react-native';
import { shadowPresets } from '@/utils/useShadow';
import ThemedText from './ThemedText';
import Icon, { IconName } from './Icon';
import useThemeColors from '@/contexts/ThemeColors';
import ThemeToggle from '@/components/ThemeToggle';
import ThemedScroller from './ThemeScroller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from './Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { messageService, Conversation } from '@/services/messages';

export default function CustomDrawerContent() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const displayName = user?.name || 'Guest User';
    const displayEmail = user?.email || 'guest@example.com';
    const avatarSource = user?.avatarUrl 
        ? { uri: user.avatarUrl } 
        : require('@/assets/img/thomino.jpg');

    // Load conversations
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const loaded = await messageService.loadConversations();
                // Sort by most recent
                const sorted = loaded.sort((a, b) => b.updatedAt - a.updatedAt);
                setConversations(sorted);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConversations();
        
        // Refresh conversations when drawer opens
        const interval = setInterval(loadConversations, 2000);
        return () => clearInterval(interval);
    }, []);

    const filteredConversations = conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewChat = async () => {
        const newConv = messageService.createConversation();
        await messageService.saveConversation(newConv);
        router.push('/(protected)/(drawer)/');
    };

    return (
        <View className="flex-1 px-global bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <ThemedScroller className='flex-1 px-0 '>
                <View className='flex-row justify-between items-center mt-4'>
                    <View
                        className='bg-secondary rounded-full relative flex-1 mr-4' style={shadowPresets.medium}>
                        <Icon name="Search" className="absolute top-4 left-4 z-50" size={20} />
                        <TextInput
                            className='h-[47px] pl-12 pr-3 rounded-lg bg-transparent text-primary'
                            placeholder='Search conversations'
                            placeholderTextColor={colors.placeholder}
                            returnKeyType="search"
                            autoFocus={false}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            accessibilityLabel="Search conversations"
                            accessibilityHint="Type to search through your conversation history"
                            accessibilityRole="search"
                        />
                    </View>
                    <ThemeToggle />
                </View>

                <View className='flex-col pb-4 mb-4 mt-4 border-b border-border'>
                    <TouchableOpacity 
                        onPress={handleNewChat}
                        className='flex-row items-center py-2 active:opacity-70'
                        accessibilityLabel="New chat"
                        accessibilityHint="Double tap to start a new conversation"
                        accessibilityRole="button"
                    >
                        <View className='flex-row items-center justify-center w-9 h-9 bg-secondary rounded-lg'>
                            <Icon name="Plus" size={18} className='' />
                        </View>
                        <View className='flex-1 ml-4 '>
                            <ThemedText className="text-base font-bold">New chat</ThemedText>
                        </View>
                    </TouchableOpacity>
                    <NavItem href="/screens/search-form" icon="LayoutGrid" label="Explore" />
                </View>

                {/* Conversation History */}
                {isLoading ? (
                    <ThemedText className="text-subtext py-4 px-4">Loading...</ThemedText>
                ) : filteredConversations.length === 0 ? (
                    <View className="py-8 px-4">
                        <ThemedText className="text-subtext text-center">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={filteredConversations}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => router.push('/(protected)/(drawer)/')}
                                className='py-3 px-4 active:opacity-70'
                                accessibilityLabel={item.title}
                                accessibilityHint="Double tap to open this conversation"
                                accessibilityRole="button"
                            >
                                <ThemedText 
                                    className='text-primary text-base font-semibold' 
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </ThemedText>
                                <ThemedText className='text-subtext text-xs mt-1'>
                                    {new Date(item.updatedAt).toLocaleDateString()}
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </ThemedScroller>

            {/* User Profile Section */}
            <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => router.push('/screens/profile')} 
                className='bg-background flex-row justify-start items-center pt-4 pb-4 border rounded-3xl px-4 border-border'
                accessibilityLabel="User profile"
                accessibilityHint="Double tap to view and edit your profile"
                accessibilityRole="button"
            >
                <Avatar src={avatarSource} size="md" />
                <View className='ml-4'>
                    <ThemedText className='text-base font-semibold'>{displayName}</ThemedText>
                    <ThemedText className='opacity-50 text-xs'>{displayEmail}</ThemedText>
                </View>
                <Icon name="ChevronRight" size={18} className='ml-auto' />
            </TouchableOpacity>
        </View>
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
    <TouchableOpacity 
        onPress={() => router.push(href)} 
        className={`flex-row items-center py-2 active:opacity-70`}
        accessibilityLabel={label}
        accessibilityHint={`Double tap to navigate to ${label}`}
        accessibilityRole="button"
    >
        <View className='flex-row items-center justify-center w-9 h-9 bg-secondary rounded-lg'>
            <Icon name={icon} size={18} className='' />
        </View>
        <View className='flex-1 ml-4 '>
            {label &&
                <ThemedText className="text-base font-bold">{label}</ThemedText>
            }
            {description &&
                <ThemedText className='opacity-50 text-xs'>{description}</ThemedText>
            }
        </View>
    </TouchableOpacity>
);
