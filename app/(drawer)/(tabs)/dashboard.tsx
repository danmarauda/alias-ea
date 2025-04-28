import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React from 'react';
import { View } from 'react-native';
import Icon, { IconName } from '@/components/Icon';
import Section from '@/components/layout/Section';
import DrawerButton from '@/components/DrawerButton';
import { renderNotification } from '@/app/screens/notifications';
import AnimatedView from '@/components/AnimatedView';
import { OrderCard } from '@/app/(drawer)/(tabs)/provider-orders';
import { StatCard } from './analytics';

// Order interfaces
interface MarketplaceOrder {
    id: number;
    serviceName: string;
    customerName: string;
    customerAvatar: any;
    date: string;
    status: 'pending' | 'completed' | 'canceled';
    totalPaid: string;
}

// Notification interfaces
interface User {
    id: number;
    name: string;
    avatar: string;
}

interface Notification {
    id: number;
    type: 'purchase' | 'message' | 'review' | 'offer' | 'seller' | 'all';
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: IconName;
    user?: User;
}

const DashboardScreen = () => {
    const rightComponents = [
        <HeaderIcon key="notifications-icon" hasBadge icon="Bell" href="/screens/notifications" />
    ];
   
    const leftComponent = [
        <DrawerButton key="drawer-button" />
    ];

    // Recent pending orders
    const pendingOrders: MarketplaceOrder[] = [
        {
            id: 2,
            serviceName: 'Website Development',
            customerName: 'Sarah Miller',
            customerAvatar: require('@/assets/img/user-2.jpg'),
            date: 'Nov 3, 2023',
            status: 'pending',
            totalPaid: '$250.00'
        },
        {
            id: 5,
            serviceName: 'Custom Illustration',
            customerName: 'Alex Thompson',
            customerAvatar: require('@/assets/img/thomino.jpg'),
            date: 'Jan 10, 2024',
            status: 'pending',
            totalPaid: '$95.00'
        }
    ];

    // Recent notifications
    const recentNotifications: Notification[] = [
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
        }
    ];


    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Header
                leftComponent={leftComponent}
                rightComponents={rightComponents}
            />

            <ThemeScroller
                scrollEventThrottle={16}
                className="px-4"
            >
                <AnimatedView animation="scaleIn" className='flex-1'>
                    <Section
                        titleSize='3xl'
                        className='mt-10 mb-6'
                        title="Welcome back"
                        subtitle="Last visit was 2 days ago"
                    />

                    <View className='flex-row w-full mb-10 mt-10'>

                        <StatCard
                            title="Revenue"
                            value="$10,923.00"
                            trend={{ value: "+20.2%", positive: true }}
                        />
                        <View className='w-2' />

                        <StatCard
                            title="Orders"
                            value="1,240"
                            trend={{ value: "+8.2%", positive: true }}
                        />


                    </View>

                    <Section
                        titleSize='lg'
                        className='mb-2'
                        title="Recent orders"
                        link="/(drawer)/(tabs)/provider-orders"
                        linkText="View all"
                    />
                    {pendingOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}

                    <Section
                        titleSize='lg'
                        className='mt-10 mb-2'
                        title="Recent notifications"
                        link="/screens/notifications"
                        linkText="View all"
                    />
                    <View className="overflow-hidden">
                        {recentNotifications.map(notification => (
                            <React.Fragment key={notification.id}>
                                {renderNotification(notification)}
                            </React.Fragment>
                        ))}
                    </View>
                </AnimatedView>
            </ThemeScroller>
        </View>
    );
}

export default DashboardScreen;