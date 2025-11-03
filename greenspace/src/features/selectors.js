import { createSelector } from 'reselect';

// Selector to get the conversations state
const getConversations = (state) => state.messages.conversations;

// Memoized selector for a specific conversation
export const selectConversationById = createSelector(
  [getConversations, (_, conversationId) => conversationId],
  (conversations, conversationId) => {
    const convId = String(conversationId);
    return conversations[convId] || { messages: [], unreadCount: 0, typingUsers: [] };
  }
);