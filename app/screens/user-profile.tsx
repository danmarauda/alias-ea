import React from 'react';
import { View, Image, TouchableOpacity, Text, Share } from 'react-native';
import { router, Link } from 'expo-router';
import ThemeTabs, { ThemeTab } from '@/components/ThemeTabs';
import ThemedText from '@/components/ThemedText';
import Icon, { IconName } from '@/components/Icon';
import Header, { HeaderIcon } from '@/components/Header';
import List from '@/components/layout/List';
import Section from '@/components/layout/Section';
import { LinearGradient } from 'expo-linear-gradient';
import Favorite from '@/components/Favorite';
import ShowRating from '@/components/ShowRating';
import Avatar from '@/components/Avatar';
import Divider from '@/components/layout/Divider';
export default function UserProfileScreen() {
    // Mock user data
    const user = {
        id: 1,
        name: 'Alex Johnson',
        location: 'New York, USA',
        rating: 4.9,
        reviewCount: 78,
        bio: 'Full-stack web developer with 6+ years of experience specializing in React and Node.js. I build responsive, scalable web applications with a focus on performance and modern UX/UI principles.',
        features: {
            experience: '6+ years',
            projects: '85+ completed',
            response: '1 hour',
            languages: 'JavaScript, TypeScript, Python'
        },
        specialties: ['React', 'Node.js', 'MongoDB', 'AWS', 'Next.js'],
        services: [
            { id: 1, title: 'Custom Website Development', price: '$2,500', image: 'https://images.unsplash.com/photo-1547658719-da2b51169166', rating: 4.8 },
            { id: 2, title: 'Web App Development', price: '$4,800', image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e', rating: 4.9 },
            { id: 3, title: 'Frontend Optimization', price: '$1,200', image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d', rating: 4.7 },
            { id: 4, title: 'API Development & Integration', price: '$1,800', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', rating: 4.9 },
            { id: 5, title: 'E-commerce Solutions', price: '$3,500', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3', rating: 4.6 },
        ],
        reviews: [
            { id: 1, user: 'Jamie Wilson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5, content: 'Alex built an amazing web app for our startup. Clean code, excellent communication, and delivered on time!', date: '2 weeks ago' },
            { id: 2, user: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', rating: 5, content: 'Incredibly talented developer who solved complex problems with elegant solutions. Will hire again!', date: '1 month ago' },
            { id: 3, user: 'Sarah Miller', avatar: 'https://randomuser.me/api/portraits/women/63.jpg', rating: 4, content: 'Great work on our e-commerce site. Performance is excellent and the UI is beautiful.', date: '2 months ago' },
        ]
    };

    // Profile header component
    const ProfileHeader = () => (
        <View>
            <View className="h-56 relative px-3 rounded-lg overflow-hidden">
                <Image
                    source={require('@/assets/img/banner.jpg')} 
                    className="w-full h-full rounded-2xl"
                    resizeMode="cover"
                />
            </View>

            <View className="px-4 -mt-12 mb-4">
                <View className="flex-row items-end">
                    <Avatar
                        src={require('@/assets/img/user-3.jpg')}
                        size="xxl"
                        border
                        className='border-4 border-light-primary dark:border-dark-primary'
                    />
                    <View className="flex-1 pl-4 pb-2">
                        <View className="flex-row items-center justify-end">
                            <ShowRating rating={user.rating} />
                            <ThemedText className="ml-1 font-normal opacity-50">({user.reviewCount} reviews)</ThemedText>
                        </View>
                    </View>
                </View>

                <ThemedText className="text-2xl font-bold mt-2">{user.name}</ThemedText>
                <View className="flex-row items-center mt-1">
                    <Icon name="MapPin" size={16} />
                    <ThemedText className="ml-1 text-light-subtext dark:text-dark-subtext">
                        {user.location}
                    </ThemedText>
                </View>
            </View>
        </View>
    );

    const ServiceCard = (props: any) => {
        return (
            <Link asChild href={`/screens/product-detail`}>
                <TouchableOpacity activeOpacity={0.8} className='w-full mb-4 flex flex-row rounded-lg overflow-hidden bg-light-secondary dark:bg-dark-secondary'>
                    <View className='w-1/3 h-[140px] relative'>
                        <Image source={{ uri: props.image }} className='w-full h-full' />
                        <LinearGradient dither={false} colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']} className='absolute w-full h-full top-0 left-0 items-start justify-start p-3'>
                            <Favorite isWhite size={20} />
                        </LinearGradient>
                    </View>
                    <View className='p-4 flex-1 justify-between'>
                        <View className='flex-1 justify-start'>
                            <ThemedText className='text-base'>{props.title}</ThemedText>
                        </View>
                        <View className='flex-row justify-between items-end flex-1'>
                            <ShowRating size='sm' rating={props.rating} />
                            <ThemedText className='text-sm font-semibold'> {props.price}
                            </ThemedText>
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };

    // Feature item component for the About tab
    const FeatureItem = ({ icon, label, value }: { icon: IconName, label: string, value: string }) => (
        <View className="flex-row items-center py-3 border-b border-light-secondary/20 dark:border-dark-secondary/20">
            <View className="w-10 h-10 rounded-full bg-light-secondary/20 dark:bg-dark-secondary/20 items-center justify-center mr-3">
                <Icon name={icon} size={18} />
            </View>
            <View className="flex-1">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">{label}</ThemedText>
                <ThemedText className="font-semibold">{value}</ThemedText>
            </View>
        </View>
    );

    // Render reviews as a list
    const renderReviews = () => (
        <List variant="divided" className="py-4 px-4" spacing={16}>
            {user.reviews.map(review => (
                <View key={review.id} className=" p-4 bg-light-secondary/10 dark:bg-dark-secondary/10 rounded-lg">
                    <View className="flex-row items-center mb-2">
                        <Image
                            source={{ uri: review.avatar }}
                            className="w-8 h-8 rounded-full"
                        />
                        <View className="ml-2 flex-1">

                            <View className="flex-row items-center justify-between flex-1">
                                <ThemedText className="font-bold">{review.user}</ThemedText>
                                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext ml-2">
                                    {review.date}
                                </ThemedText>
                            </View>
                            <View className="flex-row">
                                <ShowRating size='sm' rating={review.rating} />

                            </View>
                        </View>
                    </View>
                    <ThemedText>{review.content}</ThemedText>
                </View>
            ))}
        </List>
    );

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this provider: ${user.name}`,
                title: user.name
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };


    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Header
                showBackButton
                onBackPress={() => router.back()}
                rightComponents={[
                    <HeaderIcon icon="Share2" onPress={handleShare} href="0" />,
                    <HeaderIcon icon="MessageCircle" href="/screens/chat/user" />,
                ]}
            />
            <ThemeTabs
                headerComponent={<ProfileHeader />}
                type="fixed"

            >
                <ThemeTab name="About">
                    <View className="p-4">
                        <Section titleSize="md" title="Bio" className="">
                            <View className="mt-2">
                                <ThemedText className='text-sm'>{user.bio}</ThemedText>
                            </View>
                        </Section>
                        <Divider className='my-8' />
                        <Section title="Provider Details" titleSize="md" className="">
                            <View className="mt-3 bg-light-primary dark:bg-dark-primary rounded-lg">
                                <FeatureItem icon="Clock" label="Experience" value={user.features.experience} />
                                <FeatureItem icon="CheckCircle" label="Projects" value={user.features.projects} />
                                <FeatureItem icon="MessageCircle" label="Response Time" value={user.features.response} />
                                <FeatureItem icon="Globe" label="Languages" value={user.features.languages} />
                            </View>
                        </Section>
                        <Divider className='my-8' />
                        <Section titleSize="md" title="Specialties" className="mb-4">
                            <View className="flex-row flex-wrap mt-2">
                                {user.specialties.map((specialty, index) => (
                                    <View
                                        key={index}
                                        className="bg-light-secondary dark:bg-dark-secondary rounded-full px-4 py-2 mr-2 mb-2"
                                    >
                                        <ThemedText className="text-sm font-medium">{specialty}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </Section>
                    </View>
                </ThemeTab>

                <ThemeTab name="Services">
                    <View className="p-4">
                        {user.services.map(service => (
                            <ServiceCard
                                key={service.id}
                                id={service.id}
                                title={service.title}
                                price={service.price}
                                image={service.image}
                                rating={service.rating}
                            />
                        ))}
                    </View>
                </ThemeTab>

                <ThemeTab name="Reviews">
                    {renderReviews()}
                </ThemeTab>
            </ThemeTabs>
        </View>
    );
}
