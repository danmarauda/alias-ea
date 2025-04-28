import React, { useState } from 'react';
import { Dimensions, TouchableOpacity, Image, View, Text, Pressable, StyleSheet } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import Grid from '@/components/layout/Grid';
import Card from '@/components/Card';
import Section from '@/components/layout/Section';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { CardScroller } from '@/components/CardScroller';

import ThemeScroller from '@/components/ThemeScroller';
import { Chip } from '@/components/Chip';
import ShowRating from '@/components/ShowRating';
import Favorite from '@/components/Favorite';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@/components/Icon';
import AnimatedView from '@/components/AnimatedView';
const { width } = Dimensions.get('window');
// Sample product data
const products = [
    {
        id: 1,
        title: 'Design wordpress website with tailwind css',
        price: '$29.99',
        rating: 4.8,
        image: require('@/assets/img/service-1.jpg'),
        badge: 'New',
    },
    {
        id: 2,
        title: 'Do modern responsive website',
        price: '$59.99',
        rating: 4.6,
        image: require('@/assets/img/service-2.jpg'),
        badge: 'Sale',
    },
    {
        id: 3,
        title: 'Figma landing page, sass website',
        price: '$89.99',
        rating: 4.9,
        image: require('@/assets/img/service-3.jpg'),
    },
    {
        id: 4,
        title: 'Design or build responsive website with tailwind css',
        price: '$79.99',
        rating: 4.7,
        image: require('@/assets/img/service-4.jpg'),
    },
    {
        id: 5,
        title: 'Design wordpress website with tailwind css',
        price: '$29.99',
        rating: 4.8,
        image: require('@/assets/img/service-1.jpg'),
        badge: 'New',
    }

];

export default function ProductsScreen() {
    const [isGridView, setIsGridView] = useState(false);

    const toggleView = () => {
        setIsGridView(prev => !prev);
    };

    return (
        <>
            <Header
                rightComponents={[
                    <Icon
                        name={isGridView ? "List" : "LayoutGrid"}
                        size={26}
                        onPress={toggleView}
                    />
                ]}
                showBackButton
            />

            <ThemeScroller>
                <Section className='mt-4 mb-8' title="Website design" subtitle="Choose from a variety of website designs" titleSize="3xl" />
                <CardScroller className='mb-4'>
                    <Chip icon="SlidersHorizontal" size='lg' label="All" href="/screens/filters" />
                    <SelectableChip initialLabel="Flat" />
                    <SelectableChip initialLabel="Illustration" />
                    <SelectableChip initialLabel="Animated" />
                    <SelectableChip initialLabel="3D" />
                    <SelectableChip initialLabel="Logo" />
                    <SelectableChip initialLabel="Branding" />
                </CardScroller>

                {isGridView ? (
                    <AnimatedView key="grid-view" animation='scaleIn'>
                        <Grid columns={2} spacing={10} className="">
                            {products.map((product) => (
                                <View key={product.id} >
                                    <Card
                                        title={product.title}
                                        rounded="xl"
                                        href="/screens/product-detail"
                                        price={product.price}
                                        imageHeight={120}
                                        image={product.image}
                                        rating={product.rating}
                                        hasFavorite={true}
                                        className='min-h-[240px]'
                                    />
                                </View>
                            ))}
                        </Grid>
                    </AnimatedView>
                ) : (
                    <AnimatedView key="list-view" animation='scaleIn'>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                title={product.title}
                                image={product.image}
                                price={product.price}
                                badge={product.badge}
                                rating={product.rating}
                                id={product.id}
                            />
                        ))}
                    </AnimatedView>
                )}
            </ThemeScroller>
        </>
    );
}



const ProductCard = (props: any) => {
    return (
        <Link asChild href={`/screens/product-detail?id=${props.id}`}>
            <TouchableOpacity activeOpacity={0.8} className='w-full mb-4 flex flex-row rounded-lg overflow-hidden bg-light-secondary dark:bg-dark-secondary'>
                <View className='w-1/2 h-[140px] relative'>
                    <Image source={props.image} className='w-full h-full' />
                    <LinearGradient dither={false} colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']} className='absolute w-full h-full top-0 left-0 items-start justify-start p-3'>
                        <Favorite isWhite size={20} />
                    </LinearGradient>
                </View>
                <View className='p-4 flex-1 justify-between'>
                    <View className='flex-1 justify-start '>
                        <ThemedText className='text-base '>{props.title}</ThemedText>
                    </View>
                    <View className=' flex-row justify-between items-end flex-1'>
                        <ShowRating size='sm' rating={props.rating || 4.3} />
                        <ThemedText className='text-sm font-semibold'><Text className='text-light-subtext font-normal text-sm dark:text-dark-subtext'>from</Text> {props.price}</ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    )
}

const SelectableChip = ({ initialLabel }: { initialLabel: string }) => {
    const [isSelected, setIsSelected] = React.useState(false);

    return (
        <Chip
            size='lg'
            label={initialLabel}
            isSelected={isSelected}
            onPress={() => setIsSelected(!isSelected)}
        />
    );
};