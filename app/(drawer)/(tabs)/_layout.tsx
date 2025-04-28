import { useThemeColors } from 'app/contexts/ThemeColors';
import { TabButton } from 'components/TabButton';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { KeyboardAvoidingView, Platform, SafeAreaView, View } from 'react-native';
import React from 'react';
import { useBusinessMode } from '@/app/contexts/BusinesModeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout() {
  const colors = useThemeColors();
  const { isBusinessMode } = useBusinessMode();
  const insets = useSafeAreaInsets();
  return (

      <KeyboardAvoidingView
        style={{ flex: 1, height:80 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <Tabs
         
        >
          <TabSlot />
          <TabList
            style={{
              //height: 80,
              backgroundColor: colors.bg,
              borderTopColor: colors.secondary,
              borderTopWidth: 1,
              // paddingTop: insets.top,
              // paddingBottom: insets.bottom,
            }}
          >
            {/* Business mode tabs */}
            <TabTrigger 
              name="dashboard" 
              href="/(drawer)/(tabs)/dashboard" 
              asChild
              style={{ display: isBusinessMode ? 'flex' : 'none' }}
            >
              <TabButton labelAnimated={true} icon="LayoutGrid">Dashboard</TabButton>
            </TabTrigger>
            
            <TabTrigger 
              name="provider-orders" 
              href="/(drawer)/(tabs)/provider-orders" 
              asChild
              style={{ display: isBusinessMode ? 'flex' : 'none' }}
            >
              <TabButton labelAnimated={true} icon="FileText">Orders</TabButton>
            </TabTrigger>
            
            <TabTrigger 
              name="analytics" 
              href="/(drawer)/(tabs)/analytics" 
              asChild
              style={{ display: isBusinessMode ? 'flex' : 'none' }}
            >
              <TabButton labelAnimated={true} icon="PieChart">Analytics</TabButton>
            </TabTrigger>
            
            <TabTrigger 
              name="chat" 
              href="/(drawer)/(tabs)/chat" 
              asChild
              style={{ display: isBusinessMode ? 'flex' : 'none' }}
            >
              <TabButton labelAnimated={true} icon="MessageSquare" hasBadge>Chat</TabButton>
            </TabTrigger>

            {/* Consumer mode tabs */}
            <TabTrigger 
              name="index" 
              href="/" 
              asChild
              style={{ display: isBusinessMode ? 'none' : 'flex' }}
            >
              <TabButton labelAnimated={true} icon="Home">Home</TabButton>
            </TabTrigger>
            
            <TabTrigger 
              name="orders" 
              href="/orders" 
              asChild
              style={{ display: isBusinessMode ? 'none' : 'flex' }}
            >
              <TabButton labelAnimated={true} icon="Package">Orders</TabButton>
            </TabTrigger>
            
            <TabTrigger 
              name="search" 
              href="/(tabs)/search" 
              asChild
              style={{ display: isBusinessMode ? 'none' : 'flex' }}
            >
              <TabButton labelAnimated={true} icon="Search">Search</TabButton>
            </TabTrigger>
            
            <TabTrigger 
              name="bookmarks" 
              href="/bookmarks" 
              asChild
              style={{ display: isBusinessMode ? 'none' : 'flex' }}
            >
              <TabButton labelAnimated={true} icon="Bookmark">Bookmarks</TabButton>
            </TabTrigger>

            {/* Profile tab - always visible */}
            <TabTrigger name="profile" href="/profile" asChild>
              <TabButton avatar={require('@/assets/img/thomino.jpg')} />
            </TabTrigger>
          </TabList>
        </Tabs>
      </KeyboardAvoidingView>
  );
}
