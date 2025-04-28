import React, { useState } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import Icon from '@/components/Icon';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Avatar from '@/components/Avatar';
import ThemeFlatList from '@/components/ThemeFlatList';
// Sample customer data
const customerData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    orders: 12,
    avatar: 'https://mighty.tools/mockmind-api/content/human/5.jpg'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    orders: 8,
    avatar: 'https://mighty.tools/mockmind-api/content/human/7.jpg'
  },
  {
    id: '3',
    name: 'Michael Smith',
    email: 'mike.smith@example.com',
    orders: 23,
    avatar: 'https://mighty.tools/mockmind-api/content/human/3.jpg'
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily.w@example.com',
    orders: 5,
    avatar: 'https://mighty.tools/mockmind-api/content/human/2.jpg'
  },
  {
    id: '5',
    name: 'Alex Turner',
    email: 'alex.t@example.com',
    orders: 17,
    avatar: 'https://mighty.tools/mockmind-api/content/human/6.jpg'
  },
  {
    id: '6',
    name: 'Lisa Reynolds',
    email: 'lisa.r@example.com',
    orders: 3,
    avatar: 'https://mighty.tools/mockmind-api/content/human/4.jpg'
  },
  {
    id: '7',
    name: 'David Parker',
    email: 'david.p@example.com',
    orders: 9,
    avatar: 'https://mighty.tools/mockmind-api/content/human/1.jpg'
  },
  {
    id: '8',
    name: 'Olivia Brown',
    email: 'olivia.b@example.com',
    orders: 14,
    avatar: 'https://mighty.tools/mockmind-api/content/human/8.jpg'
  }
];

export default function AdminCustomersScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Simple filtering logic
  const filteredCustomers = customerData.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomerPress = (customerId: string) => {
    router.push(`/screens/admin/customer-detail?id=${customerId}`);
  };

  const handleChatPress = (customerId: string) => {
    router.push(`/screens/chat?customerId=${customerId}`);
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header 
        title="Customers" 
        showBackButton 
      />
      
      {/* Search bar */}
      <View className="px-global py-3">
        <View className="relative">
          <TextInput
            className="bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text py-3 px-10 rounded-lg"
            placeholder="Search customers..."
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
      
      {/* Customer list */}
      {filteredCustomers.length > 0 ? (
        <ThemeFlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              className="flex-row items-center py-4 border-b border-light-secondary dark:border-dark-secondary"
            >
              <Avatar src={item.avatar} size="md" />
              
              <View className="flex-1 ml-3">
                <ThemedText className="font-semibold">{item.name}</ThemedText>
                
                <View className="flex-row items-center mt-1">
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    {item.orders} {item.orders === 1 ? 'order' : 'orders'}
                  </ThemedText>
                </View>
              </View>
              
              <Button
                title="Chat"
                variant="outline"
                size="small"
                iconStart="MessageCircle"
                href={`/screens/chat/user`}
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Icon name="Users" size={64} className="text-light-secondary dark:text-dark-secondary mb-4" />
          <ThemedText className="text-xl font-bold mb-2">No customers found</ThemedText>
          <ThemedText className="text-center text-light-subtext dark:text-dark-subtext">
            Try a different search term
          </ThemedText>
        </View>
      )}
    </View>
  );
}
