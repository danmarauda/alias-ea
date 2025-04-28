import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import DrawerButton from '@/components/DrawerButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedView from '@/components/AnimatedView';
import { shadowPresets } from '@/utils/useShadow';
import { ChatInput } from '@/components/ChatInput';
import { BotSwitch } from '@/components/BotSwitch';

// Types for the chat messages
type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  images?: string[];
};

const HomeScreen = () => {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<MessageType[]>([
      {
        id: '1',
        text: "Hello! I'm Luna, your AI assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const rightComponents = [
        <BotSwitch />
    ];

    const leftComponent = [
        <DrawerButton key="drawer-button" />,
        <ThemedText key="app-title" className='text-2xl font-outfit-bold ml-4'>Luna<Text className="text-highlight">.</Text></ThemedText>
    ];

    // Function to handle sending a message
    const handleSendMessage = async (text: string, images?: string[]) => {
      if (!text.trim() && (!images || images.length === 0)) return;
      
      // Add user message to chat
      const userMessage: MessageType = {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date(),
        images
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsLoading(true);
      
      try {
        // In a real implementation, you would call the AI API here
        // For this mockup, we'll simulate a response
        
        setTimeout(() => {
          // Simulated AI response
          const aiResponse: MessageType = {
            id: (Date.now() + 1).toString(),
            text: getSimulatedResponse(text),
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prevMessages => [...prevMessages, aiResponse]);
          setIsLoading(false);
        }, 1000);
        
        // For real implementation with OpenAI:
        /*
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system", 
                content: "You are Luna, a helpful AI assistant."
              },
              {
                role: "user",
                content: text
              }
            ]
          })
        });
        
        const data = await response.json();
        const aiResponse: MessageType = {
          id: Date.now().toString(),
          text: data.choices[0].message.content,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, aiResponse]);
        */
      } catch (error) {
        console.error("Error sending message:", error);
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };
    
    // Scroll to bottom when messages change
    useEffect(() => {
      // In a real implementation, you would scroll to bottom
      // when messages change
    }, [messages]);
    
    return (
        <View style={{ paddingBottom: 15 }} className="flex-1 bg-light-primary dark:bg-dark-primary">
            <View className='absolute top-0 left-0 right-0'>
            <Header
                leftComponent={leftComponent}
                rightComponents={rightComponents}
            />
            </View>

            <ThemeScroller className='flex-1 px-4 pt-20'>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {isLoading && (
                  <View className="p-4 my-2 rounded-2xl bg-light-secondary dark:bg-dark-secondary max-w-[80%]">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-highlight rounded-full mx-1" />
                      <View className="w-2 h-2 bg-highlight rounded-full mx-1" />
                      <View className="w-2 h-2 bg-highlight rounded-full mx-1" />
                    </View>
                  </View>
                )}
            </ThemeScroller>
            
            <ChatInput onSendMessage={handleSendMessage} />
        </View>
    );
};

// Helper function to get simulated responses
const getSimulatedResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! How can I assist you today?";
  } else if (lowerMessage.includes('how are you')) {
    return "I'm doing well, thanks for asking! I'm here to help you with whatever you need.";
  } else if (lowerMessage.includes('weather')) {
    return "I don't have access to real-time weather data in this mockup, but in a full implementation, I could fetch current weather information for you!";
  } else if (lowerMessage.includes('help')) {
    return "I can help you with information, answering questions, generating content, and more. What specific assistance do you need?";
  } else if (lowerMessage.includes('image') || lowerMessage.includes('picture')) {
    return "In the full version, I could generate images based on your descriptions. For now, this is just a mockup of that functionality.";
  } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
    return "I can help with coding questions, explain concepts, or suggest solutions to programming problems. In a complete implementation, I could even generate code samples for you.";
  } else {
    return "That's an interesting question. In a full implementation, I would provide a more detailed and helpful response based on the OpenAI or Anthropic API.";
  }
};

// Chat message component
const ChatMessage = ({ message }: { message: MessageType }) => {
  const isUser = message.isUser;
  
  return (
    <View className={`flex-row my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 mr-2 bg-highlight rounded-full items-center justify-center">
          <Icon name="Bot" size={18} color="white" />
        </View>
      )}
      
      <View 
        style={{...shadowPresets.small}}
        className={`p-4 rounded-2xl ${
          isUser 
            ? 'bg-highlight rounded-tr-none' 
            : 'bg-light-secondary dark:bg-dark-secondary rounded-tl-none'
        } max-w-[80%]`}
      >
        {message.images && message.images.length > 0 && (
          <View className="mb-2 flex-row flex-wrap">
            {message.images.map((uri, index) => (
              <Image 
                key={index}
                source={{ uri }}
                className="w-20 h-20 rounded-lg mr-2 mb-2"
              />
            ))}
          </View>
        )}
        
        <ThemedText className={`${isUser ? 'text-white' : ''}`}>
          {message.text}
        </ThemedText>
      </View>
      
      {isUser && (
        <View className="w-8 h-8 ml-2 bg-light-secondary dark:bg-dark-secondary rounded-full items-center justify-center">
          <Icon name="User" size={18} />
        </View>
      )}
    </View>
  );
};

export default HomeScreen;