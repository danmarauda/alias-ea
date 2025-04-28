
import React, { useCallback } from 'react';
import { StyleSheet, Alert, View, Text, TouchableOpacity, Button, Pressable, Image } from 'react-native';
import testIDs from './testIDs';


interface ItemProps {
  item: any;
}

function isEmpty(value: any): boolean {
  if (value == null) return true; // null or undefined is empty
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0; // array or string with length 0 is empty
  if (typeof value === 'object') return Object.keys(value).length === 0; // object with no keys is empty
  return false; // any other case (e.g., numbers, booleans) are not empty
}

const AgendaItem = (props: ItemProps) => {
  const { item } = props;

  const buttonPressed = useCallback(() => {
    Alert.alert('Show me more');
  }, []);

  const itemPressed = useCallback(() => {
    Alert.alert(item.title);
  }, []);

  if (isEmpty(item)) {
    return (
      <View className='px-6 py-10 bg-white dark:bg-neutral-700 border-b border-slate-200 dark:border-neutral-600 flex-row'>
        <Text className='text-sm text-neutral-400'>No Events Planned Today</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={itemPressed} className='p-6 pl-0 bg-white w-full relative dark:bg-dark-primary border-b border-light-secondary dark:border-dark-secondary flex-row' testID={testIDs.agenda.ITEM}>
      <View className='items-end w-[60px]'>
        <Text className='text-xs dark:text-white'>{item.hour}</Text>
        <View className='w-[3px] h-12 my-2 bg-slate-200 dark:bg-neutral-300' />
        <Text className='text-xs dark:text-white'>{item.duration}</Text>
      </View>
      <View className='px-4 flex-row justify-between w-full relative'>
        <View className='justify-between w-full flex-shrink'>
          <Text className='text-base font-bold dark:text-white'>{item.title}</Text>
            <View>
              <Text className='text-black dark:text-white font-semibold mt-2 text-xs'>Jessica Alba</Text>
              <Text className='text-neutral-500 dark:text-white text-xs'>2 hours</Text>
            </View>
        </View>
        
      </View>
      {/*<View style={styles.itemButtonContainer}>
        <Button color={'grey'} title={'Info'} onPress={buttonPressed}/>
      </View>*/}
      <Image source={{uri: "https://mighty.tools/mockmind-api/content/human/5.jpg"}} className="w-10 h-10 absolute bottom-4 right-4 rounded-full object-cover flex-shrink-0" />
    </Pressable>
  );
};

export default React.memo(AgendaItem);


const styles = StyleSheet.create({
  item: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row'
  },
  itemHourText: {
    color: 'black'
  },
  itemDurationText: {
    color: 'grey',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  itemTitleText: {
    color: 'black',
    marginLeft: 16,
    fontWeight: 'bold',
    fontSize: 16
  },
  itemButtonContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  emptyItem: {
    paddingLeft: 20,
    height: 52,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey'
  },
  emptyItemText: {
    color: 'grey',
    fontSize: 14
  }
});
