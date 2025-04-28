import React, { useState, useRef } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Share } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import ThemedScroller from '@/components/ThemeScroller';
import ImageCarousel from '@/components/ImageCarousel';
import { ActionSheetRef } from 'react-native-actions-sheet';
import ActionSheetThemed from '@/components/ActionSheetThemed';
import { CardScroller } from '@/components/CardScroller';
import Section from '@/components/layout/Section';
import Card from '@/components/Card';
import useShadow, { shadowPresets } from '@/utils/useShadow';
import Favorite from '@/components/Favorite';
import Divider from '@/components/layout/Divider';
import ShowRating from '@/components/ShowRating';
import Icon, { IconName } from '@/components/Icon';
import { router } from 'expo-router';
import Switch from '@/components/forms/Switch';
import Avatar from '@/components/Avatar';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import AnimatedView from '@/components/AnimatedView';
const service = {
    id: 1,
    title: 'Professional Logo Design Package',
    description: 'I will create a modern, versatile logo for your brand with unlimited revisions until you are 100% satisfied. This package includes multiple concepts and all source files for print and digital use.',
    price: '$85',
    features: {
        revisions: 'Unlimited',
        deliveryDays: '3-5 days',
        concepts: '3 initial concepts',
        sourceFiles: 'Included (AI, EPS, SVG, PNG, JPG)',
    },
    ratings: {
        overall: 4.9,
        communication: 4.8,
        quality: 5.0,
        value: 4.7,
        reviews: 82
    },
    provider: {
        id: 101,
        name: 'Alex Thompson',
        avatar: require('@/assets/img/user-3.jpg'),
        location: 'San Francisco, CA',
        joinedDate: 'January 2022'
    },
    images: [
        require('@/assets/img/service-1.jpg'),
        require('@/assets/img/service-2.jpg'),
        require('@/assets/img/service-3.jpg'),
        require('@/assets/img/service-4.jpg')
    ],
};

const reviewsData = [
    {
        rating: 5,
        description: "Absolutely amazing work! Alex delivered the perfect logo for my business. The communication was excellent throughout the process.",
        date: "May 15, 2023",
        username: "Sarah M.",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        rating: 5,
        description: "Incredible attention to detail. I received multiple concepts and all were great. The final design exceeded my expectations!",
        date: "April 3, 2023",
        username: "Michael T.",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
        rating: 4,
        description: "Great quality work and very responsive. Would definitely recommend and use again for future projects.",
        date: "March 22, 2023",
        username: "Jessica K.",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg"
    },
    {
        rating: 5,
        description: "Fantastic service! The logo perfectly captures my brand identity. Very professional and accommodating with revisions.",
        date: "February 18, 2023",
        username: "David R.",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg"
    }
];

const recommendedServices = [
    {
        id: 2,
        title: "Website Development",
        price: "$250",
        image: require('@/assets/img/service-1.jpg'),
    },
    {
        id: 3,
        title: "Social Media Graphics",
        price: "$65",
        image: require('@/assets/img/service-3.jpg'),
    },
    {
        id: 4,
        title: "Brand Identity Package",
        price: "$150",
        image: require('@/assets/img/service-4.jpg'),
    },
    {
        id: 5,
        title: "Custom Illustrations",
        price: "$95",
        image: require('@/assets/img/service-2.jpg'),
    },
];

const ServiceDetail = () => {
    const [expressDelivery, setExpressDelivery] = useState(false);
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const insets = useSafeAreaInsets();

    const totalPrice = expressDelivery
        ? `$${(parseFloat(service.price.replace('$', '')) + 24).toFixed(2)}`
        : service.price;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this awesome service: ${service.title}\nPrice: ${service.price}`,
                title: service.title
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleOrder = () => {
        actionSheetRef.current?.show();
    };

    const rightComponents = [
        <Favorite productName={service.title} size={25} isWhite />,
        <HeaderIcon icon="Share2" onPress={handleShare} isWhite href="0" />,
    ];

    return (
        <>
            <StatusBar style="light" translucent />
            <Header variant='transparent' title="" rightComponents={rightComponents} showBackButton />
            <ThemedScroller className="px-0 bg-light-primary dark:bg-dark-primary">
                <ImageCarousel
                    images={service.images}
                    height={570}
                    paginationStyle="dots"
                />

                <View className="p-global">
                    <View className='py-global'>
                        <ThemedText className="text-2xl font-semibold">{service.title}</ThemedText>
                        <ThemedText className="text-lg font-normal mt-2">{service.price}</ThemedText>
                    </View>

                    <ThemedText className="mb-6 text-base">{service.description}</ThemedText>



                    {/* Provider Information */}

                    <View className="flex-row items-center mt-4 mb-4">
                        <Avatar
                            size="md"
                            src={service.provider.avatar}
                            className="mr-4"
                            link={`/screens/user-profile`}
                        />
                        <View className="ml-0">
                            <ThemedText className="font-semibold text-base">{service.provider.name}</ThemedText>
                            <View className="flex-row items-center">
                                <Icon name="MapPin" size={12} className="mr-1" />
                                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                                    {service.provider.location}
                                </ThemedText>
                            </View>

                        </View>
                    </View>



                    <Divider className="mb-4 mt-8" />

                    {/* Service Features */}
                    <Section title="Features" titleSize="lg" className="mb-6 mt-2">
                        <View className="mt-3">
                            <FeatureItem icon="Repeat" label="Revisions" value={service.features.revisions} />
                            <FeatureItem icon="Clock" label="Delivery Time" value={service.features.deliveryDays} />
                            <FeatureItem icon="Layers" label="Initial Concepts" value={service.features.concepts} />
                            <FeatureItem icon="FileText" label="Source Files" value={service.features.sourceFiles} />
                        </View>
                    </Section>

                    <Divider className="my-4" />

                    {/* Express Delivery Option */}
                    <View className="flex-row items-center justify-between">
                        <Switch
                            icon="Zap"
                            label="Express Delivery (24-48 hours)"
                            description="Get your design with priority support"
                            value={expressDelivery}
                            onChange={setExpressDelivery}
                            className="flex-1 py-3"
                        />
                        <ThemedText className="font-medium ml-2">+$24</ThemedText>
                    </View>

                    <Divider className="my-4" />

                    {/* Ratings & Reviews */}
                    <Section
                        title="Reviews"
                        titleSize="lg"
                        subtitle={`${service.ratings.reviews} reviews`}
                        className="mb-6"
                    >
                        <View className="mt-4 bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg">
                            <View className="flex-row items-center mb-4">
                                <ShowRating rating={service.ratings.overall} size="lg" />
                                <ThemedText className="ml-2 text-light-subtext dark:text-dark-subtext">
                                    ({service.ratings.reviews})
                                </ThemedText>
                            </View>

                            <View className="space-y-2">
                                <RatingItem label="Communication" rating={service.ratings.communication} />
                                <RatingItem label="Quality of Service" rating={service.ratings.quality} />
                                <RatingItem label="Value for Money" rating={service.ratings.value} />
                            </View>
                        </View>

                        <ThemedText className="mt-6 mb-3 font-semibold text-lg">Client Reviews</ThemedText>
                        <CardScroller className="mt-1" space={10}>
                            {reviewsData.map((review, index) => (
                                <View key={index} className="w-[280px] bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <Image
                                            source={{ uri: review.avatar }}
                                            className="w-10 h-10 rounded-full mr-2"
                                        />
                                        <View>
                                            <ThemedText className="font-medium">{review.username}</ThemedText>
                                            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                                                {review.date}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <ShowRating rating={review.rating} size="sm" className="mb-2" />
                                    <ThemedText className="text-sm">{review.description}</ThemedText>
                                </View>
                            ))}
                        </CardScroller>

                    </Section>

                    <Divider className="my-4" />

                    {/* Recommended Services */}
                    <Section title="You might also like" titleSize='lg' className='mb-4'>
                        <CardScroller className='mt-1' space={5}>
                            {recommendedServices.map((item) => (
                                <Card
                                    key={item.id}
                                    title={item.title}
                                    rounded='lg'
                                    image={item.image}
                                    imageHeight={120}
                                    href={`/screens/product-detail?id=${item.id}`}
                                    width={150}
                                    description={item.price}
                                />
                            ))}
                        </CardScroller>
                    </Section>
                </View>
            </ThemedScroller>

            {/* Bottom Order Bar */}
            <AnimatedView className='absolute bottom-0 left-0 right-0 p-4' animation='slideInBottom' duration={500} delay={400}>
                <View className="rounded-full overflow-hidden border border-black/20 dark:border-white/20">
                <BlurView
                    style={{ ...shadowPresets.card }}
                    intensity={60}
                    tint='systemUltraThinMaterialDark'
                    className='pl-6 pr-global py-global rounded-full border-t border-dashed border-light-subtext dark:border-dark-subtext/70 pt-4 flex-row items-center justify-start'
                //style={{ paddingBottom: insets.bottom || 16 }}
                >
                    <Image source={require('@/assets/img/service-1.jpg')} className='w-14 h-14 rounded-xl mr-4' />
                    <View>
                        <ThemedText className='text-xs opacity-60'>Service total</ThemedText>
                        <ThemedText className='text-2xl font-bold'>{totalPrice}</ThemedText>
                    </View>
                    <View className='flex-row gap-x-6 items-center ml-auto'>
                        <Button
                            title='Book Now'
                            className='bg-black dark:bg-white ml-6 px-8'
                            textClassName='text-white dark:text-black'
                            size='large'
                            onPress={handleOrder}
                            rounded='full'
                        />
                    </View>
                </BlurView>
                </View>
            </AnimatedView>

            {/* Order Confirmation Modal */}
            <ActionSheetThemed
                ref={actionSheetRef}
                //gestureEnabled
                containerStyle={{
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20
                }}
            >
                <View className="px-4 pb-8 pt-4">
                    <ThemedText className="text-lg font-bold mb-4">Confirm Your Order</ThemedText>
                    <View className="flex-row items-center mb-6">
                        <Image
                            source={service.images[0]}
                            className="w-20 h-20 rounded-lg bg-light-secondary dark:bg-dark-secondary"
                        />
                        <View className="ml-3">
                            <ThemedText className="font-bold">{service.title}</ThemedText>
                            <ThemedText className="text-light-subtext dark:text-dark-subtext">
                                {totalPrice} {expressDelivery && '(includes express delivery)'}
                            </ThemedText>
                        </View>
                    </View>

                    <View className="flex-row gap-2 w-full">
                        <Button
                            title="Cancel"
                            rounded="full"
                            className="flex-1 bg-light-primary dark:bg-dark-primary/40"
                            textClassName='text-black dark:text-white'
                            onPress={() => actionSheetRef.current?.hide()}
                        />
                        <Button
                            className="flex-1 bg-highlight"
                            rounded="full"
                            textClassName='text-white'
                            title="Proceed to Checkout"
                            onPress={() => {
                                actionSheetRef.current?.hide();
                                router.push('/screens/checkout');
                            }}
                        />
                    </View>
                </View>
            </ActionSheetThemed>
        </>
    );
};

// Feature Item Component
interface FeatureItemProps {
    icon: IconName;
    label: string;
    value: string;
}

const FeatureItem = ({ icon, label, value }: FeatureItemProps) => (
    <View className="flex-row items-center py-4">
        <Icon name={icon} size={18} className="mr-3" />
        <ThemedText className="flex-1">{label}</ThemedText>
        <ThemedText className="font-medium">{value}</ThemedText>
    </View>
);

// Rating Item Component
interface RatingItemProps {
    label: string;
    rating: number;
}

const RatingItem = ({ label, rating }: RatingItemProps) => (
    <View className="flex-row items-center justify-between py-2">
        <ThemedText className="text-sm">{label}</ThemedText>
        <View className="flex-row items-center">
            <ShowRating rating={rating} size="sm" />
        </View>
    </View>
);

export default ServiceDetail;