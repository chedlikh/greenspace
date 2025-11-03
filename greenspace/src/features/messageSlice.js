import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: {}, // Changed from messages and typingUsers to a nested structure
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action) {
      const { conversationId, messages } = action.payload;
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = { messages: [], typingUsers: [] };
      }
      const uniqueNewMessages = messages.filter(
        (newMsg) => !state.conversations[conversationId].messages.some(
          (existing) => String(existing.id) === String(newMsg.id)
        )
      );
      state.conversations[conversationId].messages = [...uniqueNewMessages, ...state.conversations[conversationId].messages];
      state.error = null;
    },
    addMessage(state, action) {
      const message = action.payload;
      const messageId = String(message.id);
      const conversationId = String(message.conversationId);
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = { messages: [], typingUsers: [] };
      }
      if (!state.conversations[conversationId].messages.some((m) => String(m.id) === messageId)) {
        state.conversations[conversationId].messages.push({ ...message, id: messageId });
      }
      state.error = null;
    },
    
    updateMessageStatus(state, action) {
      const { messageId, status } = action.payload;
      for (const conversationId in state.conversations) {
        const message = state.conversations[conversationId].messages.find(
          (m) => String(m.id) === String(messageId)
        );
        if (message) {
          message.status = status;
          message.read = status === 'READ';
          break;
        }
      }
    },
    setTypingIndicator(state, action) {
      const { conversationId, userId, firstname, lastName, isTyping } = action.payload;
      const conversationIdStr = String(conversationId);
      if (!state.conversations[conversationIdStr]) {
        state.conversations[conversationIdStr] = { messages: [], typingUsers: [] };
      }
      if (isTyping) {
        const existingUser = state.conversations[conversationIdStr].typingUsers.find(
          (u) => String(u.userId) === String(userId)
        );
        if (!existingUser) {
          state.conversations[conversationIdStr].typingUsers.push({
            userId: String(userId),
            firstname,
            lastName,
            isTyping
          });
        } else {
          existingUser.isTyping = isTyping;
          existingUser.firstname = firstname;
          existingUser.lastName = lastName;
        }
      } else {
        state.conversations[conversationIdStr].typingUsers = state.conversations[conversationIdStr].typingUsers.filter(
          (u) => String(u.userId) !== String(userId)
        );
      }
    },
    clearMessages(state, action) {
      const conversationId = String(action.payload);
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].messages = [];
        state.conversations[conversationId].typingUsers = [];
      }
    },
    setMessagesError(state, action) {
      state.error = action.payload;
    }
  }
});

export const {
  setMessages,
  addMessage,
  updateMessageStatus,
  setTypingIndicator,
  clearMessages,
  setMessagesError
} = messageSlice.actions;

export default messageSlice.reducer;