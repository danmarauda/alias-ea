/**
 * Chat History List Component
 * Displays grouped chat history with date sections
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from '@/components/Icon';
import { GroupedChats, getGroupLabel, formatChatTimestamp, Chat } from '@/utils/groupChatsByDate';

interface ChatHistoryListProps {
  groupedChats: GroupedChats;
  isLoading: boolean;
  selectedChatId?: string;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat?: (chatId: string) => void;
  onCreateChat: () => void;
}

export default function ChatHistoryList({
  groupedChats,
  isLoading,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  onCreateChat,
}: ChatHistoryListProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  const hasChats = Object.values(groupedChats).some(group => group.length > 0);

  if (!hasChats) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="MessageSquare" size={48} color="#6B7280" />
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptyDescription}>
          Start a new conversation to get help from your AI assistant
        </Text>
        <Pressable style={styles.newChatButton} onPress={onCreateChat}>
          <Icon name="Plus" size={20} color="#FFFFFF" />
          <Text style={styles.newChatButtonText}>New Conversation</Text>
        </Pressable>
      </View>
    );
  }

  const groups = ['today', 'yesterday', 'lastWeek', 'lastMonth', 'older'] as const;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* New Chat Button */}
      <Pressable 
        style={styles.newChatHeader}
        onPress={onCreateChat}
      >
        <View style={styles.newChatIcon}>
          <Icon name="Plus" size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.newChatText}>New Conversation</Text>
      </Pressable>

      {/* Chat Groups */}
      {groups.map((group) => {
        const chats = groupedChats[group];
        if (chats.length === 0) return null;

        return (
          <View key={group} style={styles.group}>
            <Text style={styles.groupLabel}>{getGroupLabel(group)}</Text>
            
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onSelect={() => onSelectChat(chat)}
                onDelete={onDeleteChat ? () => onDeleteChat(chat.id) : undefined}
              />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

function ChatItem({ chat, isSelected, onSelect, onDelete }: ChatItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chatItem,
        isSelected && styles.chatItemSelected,
        pressed && styles.chatItemPressed,
      ]}
      onPress={onSelect}
    >
      <View style={styles.chatItemContent}>
        <View style={styles.chatItemHeader}>
          <Text style={styles.chatItemTitle} numberOfLines={1}>
            {chat.title}
          </Text>
          <Text style={styles.chatItemTime}>
            {formatChatTimestamp(chat.updatedAt || chat.createdAt)}
          </Text>
        </View>
        
        {chat.lastMessage && (
          <Text style={styles.chatItemPreview} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
        )}

        <View style={styles.chatItemMeta}>
          <Icon name="MessageSquare" size={12} color="#6B7280" />
          <Text style={styles.chatItemCount}>
            {chat.messageCount || 0} messages
          </Text>
        </View>
      </View>

      {onDelete && (
        <Pressable
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete();
          }}
        >
          <Icon name="Trash2" size={16} color="#EF4444" />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    marginTop: 8,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  newChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  newChatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  group: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  groupLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    marginBottom: 8,
  },
  chatItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  chatItemPressed: {
    opacity: 0.8,
  },
  chatItemContent: {
    flex: 1,
    gap: 4,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatItemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  chatItemTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  chatItemPreview: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
  chatItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  chatItemCount: {
    color: '#6B7280',
    fontSize: 11,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
