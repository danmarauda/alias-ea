import { View, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ThemedScroller from '@/components/ThemeScroller';
import { Chip } from '@/components/Chip';
import SkeletonLoader from '@/components/SkeletonLoader';
import List from '@/components/layout/List';
import ListItem from '@/components/layout/ListItem';
import { Link } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import TabScreenWrapper from '@/components/TabScreenWrapper';
import Icon, { IconName } from '@/components/Icon';

type NotificationType = 'purchase' | 'message' | 'review' | 'offer' | 'seller' | 'all';

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: IconName;
  user?: User; // Optional user field for notifications from other users
}

export default function NotificationsScreen() {
  const [selectedType, setSelectedType] = useState<NotificationType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsData, setNotificationsData] = useState<Notification[]>([]);

  // Define notifications data outside useEffect to avoid re-creation
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'purchase',
      title: 'Purchase Successful',
      message: 'Your purchase of Vintage Camera has been confirmed',
      time: '2 min ago',
      read: false,
      icon: 'ShoppingBag'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Alex has sent you a message about your listing',
      time: '1 hour ago',
      read: true,
      icon: 'MessageCircle',
      user: {
        id: 101,
        name: 'Alex Thompson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    },
    {
      id: 3,
      type: 'offer',
      title: 'New Offer',
      message: 'Sarah made an offer on your Antique Chair',
      time: '2 hours ago',
      read: false,
      icon: 'Tag',
      user: {
        id: 102,
        name: 'Sarah Miller',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    },
    {
      id: 4,
      type: 'seller',
      title: 'Seller Updated Listing',
      message: 'The Vintage Watch you saved has been updated',
      time: '1 day ago',
      read: true,
      icon: 'RefreshCw'
    },
    {
      id: 5,
      type: 'offer',
      title: 'Offer Accepted',
      message: 'Your offer on Mountain Bike has been accepted',
      time: '2 days ago',
      read: false,
      icon: 'CheckCircle'
    },
    {
      id: 6,
      type: 'purchase',
      title: 'Item Shipped',
      message: 'Your Leather Jacket has been shipped',
      time: '3 days ago',
      read: true,
      icon: 'Truck'
    },
    {
      id: 7,
      type: 'message',
      title: 'New Message',
      message: 'Michael has questions about your iPhone listing',
      time: '4 days ago',
      read: false,
      icon: 'MessageCircle',
      user: {
        id: 103,
        name: 'Michael Chen',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
      }
    },
    {
      id: 8,
      type: 'review',
      title: 'New Review',
      message: 'Jamie left a 5-star review on your item',
      time: '5 days ago',
      read: true,
      icon: 'Star',
      user: {
        id: 104,
        name: 'Jamie Wilson',
        avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
      }
    },
    {
      id: 9,
      type: 'seller',
      title: 'Price Drop',
      message: 'Gaming Console you liked is now 20% cheaper',
      time: '6 days ago',
      read: false,
      icon: 'ArrowDown'
    },
    {
      id: 10,
      type: 'purchase',
      title: 'Purchase Issue',
      message: 'There was an issue with your payment method',
      time: '1 week ago',
      read: true,
      icon: 'AlertCircle'
    },
    {
      id: 11,
      type: 'review',
      title: 'Review Requested',
      message: 'Please review the Desk Lamp you purchased',
      time: '1 week ago',
      read: false,
      icon: 'Star'
    },
    {
      id: 12,
      type: 'offer',
      title: 'Offer Expired',
      message: 'Your offer on Bicycle Helmet has expired',
      time: '2 weeks ago',
      read: true,
      icon: 'Clock'
    }
  ];

  // Load notifications data with proper useEffect
  useEffect(() => {
    console.log("Loading notifications...");
    
    // Simulate API call with a delay
    const loadData = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set notifications data
        setNotificationsData(notifications);
        
        // Turn off loading state
        setIsLoading(false);
        console.log("Notifications loaded successfully");
      } catch (error) {
        console.error("Error loading notifications:", error);
        setIsLoading(false); // Ensure loading state is turned off even if there's an error
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      console.log("Notifications component unmounted");
    };
  }, []);  // Empty dependency array means this runs once on mount

  // Filter notifications based on selected type
  const filteredNotifications = notificationsData.filter(notification =>
    selectedType === 'all' ? true : notification.type === selectedType
  );

  

  return (
    <>
      <Header 
        showBackButton 
        title="Notifications" 
      />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <View className="p-4 flex-row gap-1">
          <Chip
            label="All"
            isSelected={selectedType === 'all'}
            onPress={() => setSelectedType('all')}
          />
          <Chip
            label="Purchases"
            isSelected={selectedType === 'purchase'}
            onPress={() => setSelectedType('purchase')}
          />
          <Chip
            label="Messages"
            isSelected={selectedType === 'message'}
            onPress={() => setSelectedType('message')}
          />
          <Chip
            label="Offers"
            isSelected={selectedType === 'offer'}
            onPress={() => setSelectedType('offer')}
          />
          <Chip
            label="Reviews"
            isSelected={selectedType === 'review'}
            onPress={() => setSelectedType('review')}
          />
          <Chip
            label="Sellers"
            isSelected={selectedType === 'seller'}
            onPress={() => setSelectedType('seller')}
          />
        </View>

        <ThemedScroller>
          {isLoading ? (
            <View className="p-4">
              <SkeletonLoader variant="list" count={6} />
            </View>
          ) : (
            <List variant="divided">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <View key={notification.id}>
                    {renderNotification(notification)}
                  </View>
                ))
              ) : (
                <View className="p-8 items-center">
                  <ThemedText>No notifications found</ThemedText>
                </View>
              )}
            </List>
          )}
        </ThemedScroller>
      </View>
    </>
  );
}

export const renderNotification = (notification: Notification) => (

    <ListItem
      leading={
        notification.user ? (
          <Image
            source={{ uri: notification.user.avatar }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="bg-light-secondary/30 dark:bg-dark-subtext/30 w-10 h-10 rounded-full items-center justify-center">
            <Icon name={notification.icon} size={20} />
          </View>
        )
      }
      title={
        <ThemedText className="font-bold">{notification.title}</ThemedText>
      }
      subtitle={notification.message}
      trailing={
        <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
          {notification.time}
        </ThemedText>
      }
      className={`py-4 ${!notification.read ? 'bg-light-secondary/5 dark:bg-dark-secondary/5' : ''}`}
    />

);