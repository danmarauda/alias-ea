/**
 * Chat History Grouping Utilities
 * Groups chats by date for organized display
 */

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt?: number;
  lastMessage?: string;
  messageCount?: number;
}

export interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
}

/**
 * Groups chats into time-based categories
 */
export function groupChatsByDate(chats: Chat[]): GroupedChats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups: GroupedChats = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  // Sort chats by most recent first
  const sortedChats = [...chats].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    return dateB - dateA;
  });

  sortedChats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt || chat.createdAt);
    const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

    if (chatDay.getTime() >= today.getTime()) {
      groups.today.push(chat);
    } else if (chatDay.getTime() >= yesterday.getTime()) {
      groups.yesterday.push(chat);
    } else if (chatDay.getTime() >= lastWeek.getTime()) {
      groups.lastWeek.push(chat);
    } else if (chatDay.getTime() >= lastMonth.getTime()) {
      groups.lastMonth.push(chat);
    } else {
      groups.older.push(chat);
    }
  });

  return groups;
}

/**
 * Get display label for a date group
 */
export function getGroupLabel(group: keyof GroupedChats): string {
  switch (group) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'lastWeek':
      return 'Last 7 days';
    case 'lastMonth':
      return 'Last 30 days';
    case 'older':
      return 'Older';
    default:
      return group;
  }
}

/**
 * Format timestamp for display
 */
export function formatChatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const chatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (chatDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (chatDay.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
    return 'Yesterday';
  }

  // Within last week, show day name
  if (chatDay.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  // Otherwise show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
