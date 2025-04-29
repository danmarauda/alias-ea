import React, { useState, useRef } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Text, Dimensions, Pressable, Animated, Easing } from 'react-native';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import { Button } from '@/components/Button';
import Section from '@/components/layout/Section';
import LottieView from 'lottie-react-native';
import { shadowPresets } from "@/utils/useShadow";

export default function AiVoiceScreen() {
  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header showBackButton
        rightComponents={[
          <Button title="Save" />
        ]}
      />

      <ScrollView className="flex-1 px-8">
        <Section title="Ai Voice" titleSize='3xl' className='py-8 mb-32' subtitle="Pick the voice that matches your style" />
        <VoiceItem name="John" description="Deep and rich tone" bg="bg-lime-300" />
        {/*<VoiceItem name="Jessica" description="Friendly and warm" bg="bg-teal-300" />
        <VoiceItem name="Larry" description="British gentleman" bg="bg-teal-300" />
        <VoiceItem name="Monday" description="Always annoyed" bg="bg-teal-300" />
        <VoiceItem name="Tomas" description="Chill and relaxed" bg="bg-teal-300" />
        <VoiceItem name="Jerry" description="Sarcastic and funny" bg="bg-teal-300" />
        <VoiceItem name="Amanda" description="Confident and strong" bg="bg-teal-300" />*/}
        
      </ScrollView>


    </View>
  );
}

const VoiceItem = (props: any) => {

  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(-80)).current;

  const toggleVisibility = () => {
    const toValue = isVisible ? -20 : -80;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
    setIsVisible(!isVisible);
  };
  
  return (
    <View className='relative mb-3'>
      <Pressable 
        className={`w-full relative z-50 flex-row items-center p-global rounded-2xl ${props.bg}`}
        onPress={toggleVisibility}
        style={{ ...shadowPresets.card }}
      >
        <View>
          <Text className='text-xl font-outfit-bold'>{props.name}</Text>
          <Text className='text-sm opacity-70'>{props.description}</Text>
        </View>
        <View className='w-10 h-10 rounded-full bg-lime-400 items-center justify-center ml-auto'>
          <Icon name={isVisible ? "Play" : "Pause"} size={20} color="black" />
        </View>
      </Pressable>
      <Animated.View
        style={{ marginTop: slideAnim }}
        className='w-full relative pb-3 px-0 pt-8 flex-row items-end overflow-hidden rounded-2xl bg-light-secondary dark:bg-dark-secondary'
      >
        <LottieView
          autoPlay
          style={{
            width: '80%',
            height: 45,
            position: 'absolute', left: -5,  bottom: 5, zIndex: 40
          }}
          source={require('@/assets/lottie/waves.json')}
        />
        <View 
        className='flex-row items-center justify-end w-full relative z-50 pr-global'>
          <Button title="Use" size='small' className='bg-dark-primary dark:bg-light-primary' textClassName='text-white dark:text-black' variant='secondary' />
        </View>
      </Animated.View>
    </View>
  )
}

