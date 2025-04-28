import { View, Image, ScrollView } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Avatar from '@/components/Avatar';
import ListLink from '@/components/ListLink';
import ThemeTabs from '@/components/ThemeTabs';
import { ThemeTab } from '@/components/ThemeTabs';
import { Placeholder } from '@/components/Placeholder';
import AnimatedView from '@/components/AnimatedView';
import ThemedScroller from '@/components/ThemeScroller';
import React from 'react';

export default function ProfileScreen() {
    const rightComponents = [
        <HeaderIcon key="settings" icon="Settings" href="/screens/settings" />,
    ];




    return (
        <>
            <Header showBackButton />
            <ThemedScroller>
                <View className=" pt-10 pb-10 w-full">
                    <View className="flex-row items-center mb-4">

                        <View className="ml-4 flex-1">
                            <ThemedText className="text-3xl font-bold">Manage your store</ThemedText>
                            <View className='flex flex-row items-center'>
                                <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext'>Velora store admin</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                <View className='px-4'>
                    <ListLink title="Analytics" description="Revenue, orders, customers" icon="PieChart" href="/screens/admin/dashboard" />
                    <ListLink title="Products" description="Add, edit, delete products" icon="Shirt" href="/screens/admin/products" />
                    <ListLink title="Orders" description="Manage orders" icon="Bookmark" href="/screens/admin/orders" />    
                    <ListLink title="Customers" description="List of customers" icon="Users" href="/screens/admin/customers" />
                    <ListLink title="Help" description="Contact support" icon="HelpCircle" href="/screens/help" />
                    <ListLink title="Logout" description="Logout from your account"  icon="LogOut" href="/screens/logout" />
                </View>
            </ThemedScroller>

        </>
    );
}