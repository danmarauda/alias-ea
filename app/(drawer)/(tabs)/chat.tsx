import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import AnimatedView from '@/components/AnimatedView';
import { Chip } from '@/components/Chip';
import { CardScroller } from '@/components/CardScroller';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

// Mock data for demonstration
const mockChats: ChatUser[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Hey, how are you doing? Just checking in to see if you received the files I sent.',
    timestamp: '2m ago',
    unread: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'The meeting has been rescheduled to tomorrow at 2 PM.',
    timestamp: '1h ago',
    unread: true,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Thanks for your help!',
    timestamp: '2h ago',
    unread: false,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: 'I just finished the design mockups for your review.',
    timestamp: '3h ago',
    unread: true,
  },
  {
    id: '5',
    name: 'David Lee',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Could you send me the project requirements again?',
    timestamp: '5h ago',
    unread: false,
  },
  {
    id: '6',
    name: 'Emily Chen',
    avatar: 'https://i.pravatar.cc/150?img=6',
    lastMessage: 'Just submitted the final draft of the proposal.',
    timestamp: 'Yesterday',
    unread: false,
  },
  {
    id: '7',
    name: 'Alex Turner',
    avatar: 'https://i.pravatar.cc/150?img=7',
    lastMessage: 'Let me know when you\'re available for a quick call.',
    timestamp: 'Yesterday',
    unread: true,
  },
  {
    id: '8',
    name: 'Olivia Martinez',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'The client loved your work on the website redesign!',
    timestamp: '2 days ago',
    unread: false,
  },
];

type FilterType = 'all' | 'read' | 'unread';

export default function ChatListScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Filter chats based on selection
  const filteredChats = mockChats.filter(chat => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'read') return !chat.unread;
    if (selectedFilter === 'unread') return chat.unread;
    return true;
  });

  // Count messages by filter type
  const unreadCount = mockChats.filter(chat => chat.unread).length;
  const readCount = mockChats.filter(chat => !chat.unread).length;

  const renderChatItem = ({ item }: { item: ChatUser }) => (
    <Link href={`/screens/chat/${item.id}`} asChild>
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b border-light-secondary dark:border-dark-secondary ${item.unread ? '' : ''}`}
      >
        <Avatar
          size="md"
          src={item.avatar}
          name={item.name}
        />
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center">
            <ThemedText className="font-medium text-base">
              {item.name}
            </ThemedText>
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
              {item.timestamp}
            </ThemedText>
          </View>
          <View className="flex-row items-center mt-1">
            <ThemedText
              numberOfLines={1}
              className={`flex-1 text-sm pr-10 ${item.unread ? 'text-black dark:text-white font-medium' : 'text-light-subtext dark:text-dark-subtext'}`}
            >
              {item.lastMessage}
            </ThemedText>
            {item.unread && (
              <View className="w-2 h-2 rounded-full bg-highlight ml-2" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header
        title="Messages"
      />
      <AnimatedView animation="scaleIn" className='flex-1'>
        <View className="px-4 py-2">
          <CardScroller className='mb-2' space={5}>
            <Chip
              label="All"
              isSelected={selectedFilter === 'all'}
              onPress={() => setSelectedFilter('all')}
            />
            <Chip
              label={`Unread (${unreadCount})`}
              isSelected={selectedFilter === 'unread'}
              onPress={() => setSelectedFilter('unread')}
            />
            <Chip
              label={`Read (${readCount})`}
              isSelected={selectedFilter === 'read'}
              onPress={() => setSelectedFilter('read')}
            />
          </CardScroller>
        </View>
        
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </AnimatedView>
    </View>
  );
}