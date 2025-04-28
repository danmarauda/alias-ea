import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React from 'react';
import CustomCard from '@/components/CustomCard';
import { View, Text, Pressable, Image } from 'react-native';
import Icon from '@/components/Icon';
import useShadow from '@/utils/useShadow';
import Section from '@/components/layout/Section';
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import ThemedText from '@/components/ThemedText';
import { Link } from 'expo-router';
import Avatar from '@/components/Avatar';
import ShowRating from '@/components/ShowRating';
import DrawerButton from '@/components/DrawerButton';
import useCollapsibleHeader from '@/app/hooks/useCollapsibleHeader';
import AnimatedView from '@/components/AnimatedView';
import { shadowPresets } from '@/utils/useShadow';

const HomeScreen = () => {
    const { headerVisible, scrollHandler } = useCollapsibleHeader();
    const rightComponents = [
        <HeaderIcon key="notifications-icon" hasBadge icon="Bell" href="/screens/notifications" />
    ];
    const middleComponent = [
        <ThemedText key="app-title" className='text-2xl font-outfit-bold'>Multia<Text className="text-highlight">.</Text></ThemedText>
    ];
    const leftComponent = [
        <DrawerButton key="drawer-button" />
    ];

    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Header
                collapsible={true}
                visible={headerVisible}
                leftComponent={leftComponent}
                rightComponents={rightComponents}
                middleComponent={middleComponent}
            />

            <ThemeScroller
                scrollEventThrottle={16}
                style={{ paddingTop: 110 }}
                onScroll={scrollHandler}
            >
                <AnimatedView animation="scaleIn" className='flex-1'>
                    <Link href="/search" asChild>
                        <Pressable
                            style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6.84, shadowOffset: { width: 0, height: 4 } }}
                            className='bg-light-primary py-3 px-10 mb-8 mt-3  dark:bg-white/20 rounded-full relative'>
                            <Icon name="Search" className="absolute top-3 left-3 z-50" size={20} />
                            <ThemedText className='text-black dark:text-white'>Search here</ThemedText>
                        </Pressable>
                    </Link>

                    <View>
                        <Section title="Popular services" titleSize="lg" link="/screens/products" linkText="View all">
                            <CardScroller space={5} className='mt-1'>
                                <CategorySelect bg="bg-teal-600" icon="MonitorCheck" title="Web design" />
                                <CategorySelect bg="bg-sky-600" icon="Feather" title="Logo design" />
                                <CategorySelect bg="bg-pink-600" icon="Video" title="Video editing" />
                                <CategorySelect bg="bg-lime-600" icon="PenTool" title="Architecture" />
                                <CategorySelect bg="bg-purple-600" icon="Facebook" title="Social media" />
                                <CategorySelect bg="bg-orange-600" icon="Award" title="Marketing" />
                            </CardScroller>
                        </Section>

                        <CustomCard
                            backgroundImage={require('@/assets/img/banner-2.jpg')}
                            className='w-full mt-6'
                            rounded='xl'
                            overlayOpacity={0}
                            href="/screens/products"
                        >
                            <View className="p-6 w-full h-64 flex flex-col justify-end">
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-white text-2xl font-outfit-bold">Created with Multia.</Text>
                                        <Text className="text-white text-xs mb-3">Check latest works from our creators</Text>
                                    </View>
                                </View>
                                <View className='flex-row items-center justify-start bg-white rounded-full mr-auto py-1 px-4 mt-1'>
                                    <Text className="text-sm text-black">
                                        View all
                                    </Text>
                                </View>
                            </View>
                        </CustomCard>

                        <Section title="Recently viewed" titleSize="lg" className='pt-10' link="/screens/products" linkText="View all">
                            <CardScroller space={5} className='mt-1 pb-4' >
                                <Card
                                    title="Have a website for your business"
                                    rounded="xl"
                                    href="/screens/product-detail"
                                    price="$100"
                                    hasShadow={true}
                                    width={160}
                                    imageHeight={120}
                                    image={require('@/assets/img/service-1.jpg')} />
                                <Card
                                    title="Creating art for your brand"
                                    rounded="xl"
                                    href="/screens/product-detail"
                                    price="$100"
                                    hasShadow={true}
                                    width={160}
                                    imageHeight={120}
                                    image={require('@/assets/img/service-3.jpg')} />
                                <Card
                                    title="Creating a logo for your business"
                                    rounded="xl"
                                    href="/screens/product-detail"
                                    price="$100"
                                    hasShadow={true}
                                    width={160}
                                    imageHeight={120}
                                    image={require('@/assets/img/service-2.jpg')} />
                                <Card
                                    title="Vibrant illustrations for your business"
                                    rounded="xl"
                                    href="/screens/product-detail"
                                    price="$100"
                                    hasShadow={true}
                                    width={160}
                                    imageHeight={120}
                                    image={require('@/assets/img/service-4.jpg')} />
                            </CardScroller>
                        </Section>

                        <Section title="Popular users" titleSize="lg" className='mt-6' link="/screens/products" linkText="View all">

                            <CardScroller space={5} className='mt-1 pb-4'>
                                <PopularUsers image={require('@/assets/img/banner.jpg')} avatar={require('@/assets/img/thomino.jpg')} name="John Doe" location="New York" rating={4.5} descfiption="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit" />
                                <PopularUsers image={require('@/assets/img/banner-4.jpg')} avatar={require('@/assets/img/thomino.jpg')} name="John Doe" location="New York" rating={4.5} descfiption="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit" />
                                <PopularUsers image={require('@/assets/img/banner-3.jpg')} avatar={require('@/assets/img/thomino.jpg')} name="John Doe" location="New York" rating={4.5} descfiption="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit" />
                            </CardScroller>
                        </Section>

                        <Section title="Upcoming events" titleSize="lg" className='mt-10' link="/screens/products" linkText="View all">

                            <CardScroller space={5} className='mt-1'>
                                <View className='w-80'>
                                    <EventCard image={require('@/assets/img/banner.jpg')} title="Web dev conference" location="New York" />
                                    <EventCard image={require('@/assets/img/banner-4.jpg')} title="Figma workshop" location="Barcelona" />
                                    <EventCard image={require('@/assets/img/banner-2.jpg')} title="Cursor discovery" location="New York" />
                                </View>
                                <View className='w-80'>
                                    <EventCard image={require('@/assets/img/banner-2.jpg')} title="Web dev conference" location="New York" />
                                    <EventCard image={require('@/assets/img/banner-3.jpg')} title="Figma workshop" location="New York" />
                                    <EventCard image={require('@/assets/img/banner.jpg')} title="Cursor discovery" location="New York" />
                                </View>
                            </CardScroller>
                        </Section>
                    </View>
                </AnimatedView>
            </ThemeScroller>
        </View>
    );
}

export const SearchPressable = () => {
    return (
        <Link href="/screens/search-form" asChild>
            <Pressable
                style={{ ...shadowPresets.card }}
                className='bg-light-primary py-3 px-10   dark:bg-white/20 rounded-full relative flex-1'>
                <Icon name="Search" className="absolute top-3 left-3 z-50" size={20} />
                <ThemedText className='text-black dark:text-white'>Search here</ThemedText>
            </Pressable>
        </Link>
    )
}

const CategorySelect = (props: any) => {
    return (
        <Link href="/screens/products" asChild>
            <Pressable className={`flex-col flex items-between py-4 pl-4 justify-between w-28  rounded-xl ${props.bg}`}>
                <View className='flex items-start justify-start mb-6'>
                    <Icon name={props.icon} strokeWidth={1.2} size={24} color="white" />
                </View>
                <Text className="text-xs w-full text-left font-semibold text-white mt-1">{props.title}</Text>
            </Pressable>
        </Link>
    )
}

const PopularUsers = (props: any) => {
    return (
        <Link href="/screens/user-profile" asChild>
            <Pressable
            style={{
                ...shadowPresets.card
            }}
            className="w-80 rounded-xl  bg-neutral-100 dark:bg-dark-secondary">
                <Image source={props.image} className="w-full h-36 rounded-xl" />
                <View className='p-4 pt-0 items-start -mt-10'>
                    <View className='rounded-full border-4 border-light-secondary dark:border-dark-secondary'>
                        <Avatar src={props.avatar} size="lg" />
                    </View>
                    <View className='w-full flex-row items-center justify-between'>
                        <ThemedText className='text-base font-semibold mt-2'>{props.name}</ThemedText>
                        <ShowRating rating={props.rating} />
                    </View>
                    <View className='w-full flex-row items-center justify-start opacity-50'>
                        <Icon name="MapPin" size={12} />
                        <ThemedText className='text-xs ml-1'>{props.location}</ThemedText>
                    </View>
                    <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext mt-3'>{props.descfiption}</ThemedText>
                </View>
            </Pressable>
        </Link>
    )
}

const EventCard = (props: any) => {
    return (
        <Pressable 
        style={{
            ...shadowPresets.card
        }}
        className="w-full flex flex-row mb-2 items-center p-2 rounded-xl  bg-light-secondary dark:bg-dark-secondary">
            <Image source={props.image} className=" w-16 h-16 rounded-xl" />
            <View className='ml-4'>
                <ThemedText className='text-sm font-semibold  '>{props.title}</ThemedText>
                <View className='flex-row items-center opacity-50'>
                    <Icon name="MapPin" size={12} />
                    <ThemedText className='text-xs ml-1'>{props.location}</ThemedText>
                </View>
            </View>
        </Pressable>
    )
}

export default HomeScreen;