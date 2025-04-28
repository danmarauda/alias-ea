import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Pressable, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import Icon, { IconName } from '@/components/Icon';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import List from '@/components/layout/List';
import ListItem from '@/components/layout/ListItem';
import Section from '@/components/layout/Section';
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import { Chip } from '@/components/Chip';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchCategory = 'all' | 'products' | 'services' | 'users';

const SearchScreen = () => {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [category, setCategory] = useState<SearchCategory>('all');
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

 

  const services = [
    { id: 101, type: 'service', name: 'Logo Design', price: '$50', image: require('@/assets/img/service-2.jpg') },
    { id: 102, type: 'service', name: 'Website Development', price: '$200', image: require('@/assets/img/service-1.jpg') },
    { id: 103, type: 'service', name: 'Illustration', price: '$45', image: require('@/assets/img/service-4.jpg') },
  ];

  const users = [
    { id: 201, type: 'user', name: 'Alex Thompson', bio: 'Sells vintage items', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 202, type: 'user', name: 'Sarah Miller', bio: 'Digital artist and designer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 203, type: 'user', name: 'Michael Chen', bio: 'Electronics and gadgets', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
  ];

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const filterData = (data: any[]) => {
    if (!searchQuery) return data;
    return data.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.bio && item.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getFilteredResults = () => {
    const filteredServices = filterData(services);
    const filteredUsers = filterData(users);

    switch (category) {
      case 'services':
        return filteredServices;
      case 'users':
        return filteredUsers;
      case 'all':
      default:
        return [ ...filteredServices, ...filteredUsers];
    }
  };

  const results = getFilteredResults();

  return (
    <>
      <View style={{ paddingTop: insets.top }} className='p-global bg-light-primary dark:bg-dark-primary'>
        <View 
        style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6.84, shadowOffset: { width: 0, height: 4 } }}
        className='bg-light-primary dark:bg-white/20 rounded-full relative'>
          <Icon name="ArrowLeft" onPress={() => router.back()} className="absolute top-1.5 left-1.5 z-50" size={20} />

          <TextInput
            ref={inputRef}
            className='py-3 pl-10 pr-3 rounded-lg text-black dark:text-white'
            placeholder='Search marketplace'
            placeholderTextColor={colors.placeholder}
            onChangeText={setSearchQuery}
            value={searchQuery}
            returnKeyType="done"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(searchQuery.length > 0)}
            autoFocus={true}
          />

          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setIsInputFocused(true);
                inputRef.current?.focus();
              }}
              className="absolute top-3 right-3 z-50 opacity-50"
            >
              <Icon name='X' size={20} />
            </Pressable>
          )}
        </View>

        <View className="flex-row gap-2 mt-3">
          <Chip
            label="All"
            isSelected={category === 'all'}
            onPress={() => setCategory('all')}
          />
        
          <Chip
            label="Services"
            isSelected={category === 'services'}
            onPress={() => setCategory('services')}
          />
          <Chip
            label="Users"
            isSelected={category === 'users'}
            onPress={() => setCategory('users')}
          />
        </View>
      </View>

      <ThemedScroller className='flex-1 px-0' keyboardShouldPersistTaps='handled'>
        <SearchResults
          title={searchQuery ? "Search Results" : null}
          data={results}
        />

        <Section title="Recently viewed" titleSize="lg" className='pt-6 pb-6 px-global' link="/screens/products" linkText="View all">
          <CardScroller space={5} className='mt-1'>
            <Card
              title="Web design"
              rounded="xl"
              price="$200"
              width={160}
              imageHeight={120}
              image={require('@/assets/img/service-1.jpg')} />
            <Card
              title="Logo Design"
              rounded="xl"
              price="$50"
              width={160}
              imageHeight={120}
              image={require('@/assets/img/service-2.jpg')} />
            <Card
              title="Custom Illustrations"
              rounded="xl"
              price="$45"
              width={160}
              imageHeight={120}
              image={require('@/assets/img/service-3.jpg')} />
            <Card
              title="Digital Art"
              rounded="xl"
              price="$65"
              width={160}
              imageHeight={120}
              image={require('@/assets/img/service-4.jpg')} />
          </CardScroller>
        </Section>
      </ThemedScroller>
    </>
  );
};

interface SearchResultsProps {
  title: string | null;
  data: any[];
}

const SearchResults = ({ title, data }: SearchResultsProps) => {
  const services = data.filter(item => item.type === 'service');
  const users = data.filter(item => item.type === 'user');
  
  return (
    <>
      {data.length > 0 ? (
        <View className='mb-4 p-global'>
          {title && (
            <ThemedText className='text-lg font-bold mb-4'>{data.length} {title}</ThemedText>
          )}
          
          {services.length > 0 && (
            <>
              <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext mt-2 mb-2'>Services</ThemedText>
              <List spacing={25} variant="separated">
                {services.map((item) => (
                  <View key={item.id}>
                    <ProductServiceItem item={item} />
                  </View>
                ))}
              </List>
            </>
          )}
          
          {users.length > 0 && (
            <>
              <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext mt-4 mb-2'>Users</ThemedText>
              <List spacing={25} variant="separated">
                {users.map((item) => (
                  <View key={item.id}>
                    <UserItem user={item} />
                  </View>
                ))}
              </List>
            </>
          )}
        </View>
      ) : (
        <View className='items-center justify-center p-10'>
          <ThemedText className='text-lg font-bold mb-2 text-center'>
            No results found
          </ThemedText>
          <ThemedText className='text-center text-light-subtext dark:text-dark-subtext'>
            Try different keywords or categories
          </ThemedText>
        </View>
      )}
    </>
  );
};

interface ProductServiceProps {
  item: {
    id: number;
    type: string;
    image: any;
    name: string;
    price: string;
  };
}

const ProductServiceItem = ({ item }: ProductServiceProps) => (
  <Link href={`/screens/${item.type === 'service' ? 'service' : 'product'}-detail?id=${item.id}`} asChild>
    <ListItem
      leading={
        <Image
          source={item.image}
          className='w-12 h-12 rounded-md bg-light-secondary dark:bg-dark-secondary'
        />
      }
      title={item.name}
      subtitle={item.price}
      trailing={<Icon name="ChevronRight" size={15} className="opacity-50" />}
    />
  </Link>
);

interface UserProps {
  user: {
    id: number;
    avatar: string;
    name: string;
    bio: string;
  };
}

const UserItem = ({ user }: UserProps) => (
  <Link href={`/screens/user-profile?id=${user.id}`} asChild>
    <ListItem
      leading={
        <Image
          source={{ uri: user.avatar }}
          className='w-12 h-12 rounded-full bg-light-secondary dark:bg-dark-secondary'
        />
      }
      title={user.name}
      subtitle={user.bio}
      trailing={<Icon name="ChevronRight" size={15} className="opacity-50" />}
    />
  </Link>
);

export default SearchScreen;
