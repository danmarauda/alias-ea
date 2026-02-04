/**
 * Chat Panel Component
 * Real-time chat using LiveKit data channels
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from '@/components/Icon';

interface Message {
  from: string;
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  currentUser,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Messages list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="MessageSquare" size={48} color="#4B5563" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation with participants</Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.from === currentUser;
            return (
              <View
                key={`${message.timestamp}-${index}`}
                style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.messageContainerSent : styles.messageContainerReceived,
                ]}
              >
                {!isCurrentUser && (
                  <Text style={styles.messageSender}>{message.from}</Text>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isCurrentUser ? styles.messageBubbleSent : styles.messageBubbleReceived,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isCurrentUser ? styles.messageTextSent : styles.messageTextReceived,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#6B7280"
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
          >
            <Icon
              name="Send"
              size={20}
              color={inputText.trim() ? '#FFFFFF' : '#6B7280'}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageContainerSent: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageContainerReceived: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageSender: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 4,
  },
  messageBubbleSent: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: '#1F1F1F',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextSent: {
    color: '#FFFFFF',
  },
  messageTextReceived: {
    color: '#E5E7EB',
  },
  messageTime: {
    color: '#6B7280',
    fontSize: 11,
  },
  inputContainer: {
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1F1F1F',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});
