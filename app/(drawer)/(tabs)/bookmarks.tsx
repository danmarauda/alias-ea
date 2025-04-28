import React, { useState } from 'react';
import { View, Pressable, Image, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/ThemedText';
import Section from '@/components/layout/Section';
import Favorite from '@/components/Favorite';
import { Link } from 'expo-router';
import { shadowPresets } from '@/utils/useShadow';
import ThemeScroller from '@/components/ThemeScroller';
import { Placeholder } from '@/components/Placeholder';
import ShowRating from '@/components/ShowRating';
import { LinearGradient } from 'expo-linear-gradient';
import { Chip } from '@/components/Chip';
import { CardScroller } from '@/components/CardScroller';
import AnimatedView from '@/components/AnimatedView';
import Header from '@/components/Header';

type Category = 'all' | 'logo' | 'web-design' | 'web-development';

// Mock data for saved/bookmarked services
const savedItems = [
  {
    id: 1,
    title: 'Design wordpress website with tailwind css',
    price: '$120',
    rating: 4.8,
    image: require('@/assets/img/service-1.jpg'),
    category: 'web-design'
  },
  {
    id: 2,
    title: 'Custom logo design for your brand',
    price: '$85',
    rating: 4.6,
    image: require('@/assets/img/service-2.jpg'),
    category: 'logo'
  },
  {
    id: 3,
    title: 'Illustration artwork for marketing',
    price: '$95',
    rating: 4.9,
    image: require('@/assets/img/service-3.jpg'),
    category: 'logo'
  },
  {
    id: 4,
    title: 'UI/UX design for mobile applications',
    price: '$150',
    rating: 4.7,
    image: require('@/assets/img/service-4.jpg'),
    category: 'web-design'
  },
  {
    id: 5,
    title: 'Full-stack web application development',
    price: '$250',
    rating: 4.5,
    image: require('@/assets/img/service-1.jpg'),
    category: 'web-development'
  },
];

const BookmarksScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const filteredItems = selectedCategory === 'all'
    ? savedItems
    : savedItems.filter(item => item.category === selectedCategory);

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <AnimatedView animation="scaleIn" className='flex-1'>
        <Header />
        <ThemeScroller>
          <Section
            titleSize='3xl'
            className='my-16'
            title="Saved Services"
            subtitle={`${filteredItems.length} services in your bookmarks`}
          />

          <CardScroller className='mb-4' space={5}>
            <Chip
              label="All"
              isSelected={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
            />
            <Chip
              label="Logo Design"
              isSelected={selectedCategory === 'logo'}
              onPress={() => setSelectedCategory('logo')}
            />
            <Chip
              label="Web Design"
              isSelected={selectedCategory === 'web-design'}
              onPress={() => setSelectedCategory('web-design')}
            />
            <Chip
              label="Web Development"
              isSelected={selectedCategory === 'web-development'}
              onPress={() => setSelectedCategory('web-development')}
            />
          </CardScroller>

          {filteredItems.length > 0 ? (
            <>
              {filteredItems.map((item) => (
                <SavedItemCard
                  key={item.id}
                  title={item.title}
                  image={item.image}
                  price={item.price}
                  rating={item.rating}
                />
              ))}
            </>
          ) : (
            <Placeholder
              title="No saved items in this category"
              subtitle="Browse services and save your favorites"
            />
          )}
        </ThemeScroller>
      </AnimatedView>
    </View>
  );
};

interface SavedItemCardProps {
  title: string;
  image: any;
  price: string;
  rating: number;
}

const SavedItemCard = ({ title, image, price, rating }: SavedItemCardProps) => {
  return (
    <Link asChild href="/screens/product-detail">
      <TouchableOpacity 
      style={{
        ...shadowPresets.card
    }}
      activeOpacity={0.8} className='w-full mb-4 flex flex-row rounded-lg bg-light-secondary dark:bg-dark-secondary'>
        <View className='w-1/3 h-[110px] relative'>
          <Image source={image} className='w-full h-full rounded-l-lg' />
          <LinearGradient
            dither={false}
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
            className='absolute w-full h-full top-0 left-0 items-start justify-start p-3 rounded-l-lg'
          >
            <Favorite initialState={true} size={20} isWhite />
          </LinearGradient>
        </View>
        <View className='p-3 flex-1 justify-between'>
          <View className='flex-1 justify-start'>
            <ThemedText className='text-sm font-semibold'>{title}</ThemedText>
          </View>
          <View className='flex-row justify-between items-end flex-1'>
            <ShowRating size='sm' rating={rating} />
            <ThemedText className='text-sm font-semibold'>{price}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default BookmarksScreen; 