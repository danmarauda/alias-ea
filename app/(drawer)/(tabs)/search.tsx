import React from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Icon from '@/components/Icon';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import AnimatedView from '@/components/AnimatedView';
import Header from '@/components/Header';
import { SearchPressable } from './index';
const MainSearchScreen = () => {

  const arrivals = [
    {
      id: 1,
      title: 'Premium Cotton T-Shirt',
      description: 'High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
      price: '$29.99',
      rating: 4.8,
      image: require('@/assets/img/male.jpg'),
    },
    {
      id: 2,
      title: 'Classic Denim Jeans',
      description: 'Classic fit denim jeans with premium quality fabric.',
      price: '$59.99',
      rating: 4.6,
      image: require('@/assets/img/female-2.jpg'),
    },
    {
      id: 3,
      title: 'Leather Sneakers',
      description: 'Stylish leather sneakers with cushioned sole.',
      price: '$89.99',
      rating: 4.9,
      image: require('@/assets/img/female-1.jpg'),
    },
    {
      id: 4,
      title: 'Wool Sweater',
      description: 'Warm and cozy wool sweater for cold days.',
      price: '$79.99',
      rating: 4.7,
      image: require('@/assets/img/male-2.jpg'),
    },
  ];

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <AnimatedView animation="scaleIn" className='flex-1'>
        <Header className='pb-4'>
            <SearchPressable />
        </Header>


        <ThemedScroller>

          <Category bg="bg-green-600" name="Graphics & Design" description="Logo & brand identity, art & illustration" icon="Feather" />
          <Category bg="bg-sky-600" name="Digital Marketing" description="Social media marketing, email marketing" icon="Facebook" />
          <Category bg="bg-pink-600" name="Video & Animation" description="Video production, animation" icon="Video" />
          <Category bg="bg-lime-600" name="Music & Audio" description="Music production, sound design" icon="Music" />
          <Category bg="bg-purple-600" name="Programming & Tech" description="Web development, mobile apps" icon="MonitorCheck" />
          <Category bg="bg-orange-600" name="Writing & Translation" description="Content writing, translation" icon="BookType" />
          <Category bg="bg-red-600" name="Business & Marketing" description="Marketing strategy, business plan" icon="Award" />
          <Category bg="bg-blue-600" name="Architecture & Interior" description="Interior design, architecture" icon="PenTool" />
          <Category bg="bg-yellow-600" name="Science & Education" description="Research, data analysis" icon="Rocket" />
          <Category bg="bg-teal-600" name="Photography" description="Photo editing, retouching" icon="Camera" />




        </ThemedScroller>
      </AnimatedView>
    </View>
  );
};

const Category = (props: any) => (
  <Link href="/screens/products" asChild>
    <TouchableOpacity activeOpacity={0.8} className='flex-row mb-1 items-center py-4 rounded-xl border-b border-light-secondary dark:border-dark-secondary'>
      <View className={`w-12 h-12 bg-light-secondary mr-4 items-center justify-center dark:bg-dark-secondary rounded-lg ${props.bg}`}>
        <Icon name={props.icon} size={24} strokeWidth={1.3} color="white" />
      </View>
      <View className='mr-auto flex-1'>
        <ThemedText className='text-base font-bold'>{props.name}</ThemedText>
        <ThemedText className='text-sm'>{props.description}</ThemedText>
      </View>
      <Icon name="ChevronRight" size={24} strokeWidth={1.3} className="opacity-50 ml-auto " />
    </TouchableOpacity>
  </Link>
)

export default MainSearchScreen;
