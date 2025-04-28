import React, { useState } from 'react';
import { View, Image, FlatList, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import Icon from '@/components/Icon';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import AnimatedView from '@/components/AnimatedView';
import { Chip } from '@/components/Chip';
import Section from '@/components/layout/Section';
import FloatingButton from '@/components/FloatingButton';

// Sample product data using existing images
const productData = [
  {
    id: '1',
    title: 'Premium Cotton T-Shirt',
    stock: 42,
    image: require('@/assets/img/male.jpg'),
    category: 'clothing'
  },
  {
    id: '2',
    title: 'Classic Denim Jeans',
    stock: 28,
    image: require('@/assets/img/female-2.jpg'),
    category: 'clothing'
  },
  {
    id: '3',
    title: 'Leather Sneakers',
    stock: 15,
    image: require('@/assets/img/female-1.jpg'),
    category: 'footwear'
  },
  {
    id: '4',
    title: 'Wool Sweater',
    stock: 7,
    image: require('@/assets/img/male-2.jpg'),
    category: 'clothing'
  },
  {
    id: '5',
    title: 'Running Shoes',
    stock: 22,
    image: require('@/assets/img/female-1.jpg'),
    category: 'footwear'
  },
  {
    id: '6',
    title: 'Designer Sunglasses',
    stock: 16,
    image: require('@/assets/img/male.jpg'),
    category: 'accessories'
  },
  {
    id: '7',
    title: 'Winter Coat',
    stock: 9,
    image: require('@/assets/img/female-2.jpg'),
    category: 'clothing'
  },
  {
    id: '8',
    title: 'Leather Wallet',
    stock: 31,
    image: require('@/assets/img/male-2.jpg'),
    category: 'accessories'
  }
];

// Categories for filtering
const categories = [
  { id: 'all', label: 'All' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'low-stock', label: 'Low Stock' }
];

export default function AdminProductsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Simple filtering logic
  const filteredProducts = productData.filter(product => {
    // Filter by search query
    const matchesQuery = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = 
      selectedCategory === 'all' || 
      product.category === selectedCategory || 
      (selectedCategory === 'low-stock' && product.stock < 10);
    
    return matchesQuery && matchesCategory;
  });

  const handleProductPress = (productId: string) => {
    router.push(`/screens/admin/add-product-flow`);
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header 
        title="Products" 
        showBackButton 
        rightComponents={[
          <TouchableOpacity 
            key="add" 
            className="ml-2" 
            onPress={() => router.push('/screens/admin/add-product-flow')}
          >
            <Icon name="Plus" size={24} />
          </TouchableOpacity>
        ]}
      />
      

        {/* Search bar */}
        <View className="px-global py-3">
          <View className="relative">
            <TextInput
              className="bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text py-3 px-10 rounded-lg"
              placeholder="Search products..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Icon name="Search" size={20} className="absolute top-3.5 left-3" />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                className="absolute top-3 right-3" 
                onPress={() => setSearchQuery('')}
              >
                <Icon name="X" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Category filters */}
        <View className="px-global py-2">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Chip
                label={item.label}
                selectable
                isSelected={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
                className="mr-2"
              />
            )}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>
        
        {/* Products list */}
        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleProductPress(item.id)}
                className="flex-row items-center px-global py-3 border-b border-light-secondary dark:border-dark-secondary"
              >
                <Image
                  source={item.image}
                  className="w-16 h-20 rounded-md"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <ThemedText className="font-semibold">{item.title}</ThemedText>
                  <View className="flex-row items-center mt-1">
                    <View className={`w-2 h-2 rounded-full ${item.stock < 10 ? 'bg-red-500' : 'bg-green-500'} mr-2`} />
                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                      {item.stock} in stock
                    </ThemedText>
                  </View>
                </View>
                <Icon name="ChevronRight" size={20} className="opacity-30" />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Icon name="Package" size={64} className="text-light-secondary dark:text-dark-secondary mb-4" />
            <ThemedText className="text-xl font-bold mb-2">No products found</ThemedText>
            <ThemedText className="text-center text-light-subtext dark:text-dark-subtext">
              Try changing your search or filter criteria
            </ThemedText>
          </View>
        )}
        <FloatingButton
          icon="Plus"
          label="Add Product"
          onPress={() => router.push('/screens/admin/add-product-flow')}
        />
    </View>
  );
}
