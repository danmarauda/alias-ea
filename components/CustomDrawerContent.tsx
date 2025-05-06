import { Link, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, TextInput, Touchable } from 'react-native';
import ThemedText from './ThemedText';
import Icon, { IconName } from './Icon';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemeToggle from '@/components/ThemeToggle';
import ThemedScroller from './ThemeScroller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from './Avatar';



const History = [
    { label: 'Home', href: '/' },
    { label: 'Chat with suggestions', href: '/(drawer)/suggestions' },
    { label: 'Lottie animation', href: '/(drawer)/lottie' },
    { label: 'What is the best way to learn React Native?', href: '/screens/search-form' },
    { label: 'How to get rich fast?', href: '/screens/search-form' }
];


export default function CustomDrawerContent() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    return (
        <View className="flex-1 px-global bg-white dark:bg-dark-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <ThemedScroller className='flex-1 px-0'>
                <View className='flex-row justify-between items-center mt-4'>
                    <View
                        className='bg-light-secondary dark:bg-white/20 rounded-full relative flex-1 mr-4'>
                        <Icon name="Search" className="absolute top-3.5 left-4 z-50" size={20} />
                        <TextInput
                            //ref={inputRef}
                            className='h-[47px] pl-12 pr-3 rounded-lg text-black dark:text-white'
                            placeholder='Search'
                            placeholderTextColor={colors.placeholder}
                            //onChangeText={setSearchQuery}
                            //value={searchQuery}
                            returnKeyType="done"
                            //onFocus={() => setIsInputFocused(true)}
                            //onBlur={() => setIsInputFocused(searchQuery.length > 0)}
                            autoFocus={true}
                        />
                    </View>
                    <ThemeToggle />
                </View>


                <View className='flex-col pb-4 mb-4 mt-4 border-b border-light-secondary dark:border-dark-secondary'>
                    <NavItem href="/" icon="Plus" label="New chat" />
                    <NavItem href="/screens/search-form" icon="LayoutGrid" label="Explore" />
                </View>

                {History.map((item, index) => (
                    <Link className='text-black dark:text-white text-base font-semibold py-3' key={index} href={item.href}>
                        {item.label}
                    </Link>
                ))}

            </ThemedScroller>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/screens/profile')} className='flex-row justify-start items-center pt-4 pb-4  border-t border-light-secondary dark:border-dark-secondary'>
                <Avatar src={require('@/assets/img/thomino.jpg')} size="md" />
                <View className='ml-4'>
                    <ThemedText className='text-base font-semibold'>Thomino</ThemedText>
                    <ThemedText className='opacity-50 text-xs'>thomino@gmail.com</ThemedText>
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
        <TouchableOpacity className={`flex-row items-center py-2`}>
            <View className='flex-row items-center justify-center w-9 h-9 bg-light-secondary dark:bg-dark-secondary rounded-lg'>
                <Icon name={icon} size={18} className='' />
            </View>
            <View className='flex-1 ml-4 '>
                {label &&
                    <ThemedText className="text-base font-bold text-gray-800 dark:text-gray-200">{label}</ThemedText>
                }
                {description &&
                    <ThemedText className='opacity-50 text-xs'>{description}</ThemedText>
                }
            </View>

        </TouchableOpacity>
);


