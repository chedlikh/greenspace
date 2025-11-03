// chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  typingIndicators: {},
  reactions: {},
  // Store incoming signals temporarily. Downstream logic (e.g., WebRTC hooks/components)
  // needs to select this state, process signals (offer, answer, candidate),
  // and interact with the RTCPeerConnection accordingly.
  callSignals: [], 
  notifications: [],
  activeCall: null, // Stores information about the current incoming or active call
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action) {
      const message = action.payload;
      const messageId = String(message.id);
      // Avoid duplicates
      if (!state.messages.some((m) => String(m.id) === messageId)) {
        // Consider prepending for chronological order if messages are fetched oldest first
        state.messages.push({ ...message, id: messageId }); 
      }
      state.error = null;
    },
    setMessages(state, action) {
      // Ensure messages are unique when setting initial list
      const uniqueNewMessages = action.payload.filter(
        (newMsg) => !state.messages.some((existing) => String(existing.id) === String(newMsg.id))
      );
      // Consider sorting or merging based on timestamp
      state.messages = [...uniqueNewMessages, ...state.messages]; 
      state.error = null;
    },
    updateTypingIndicator(state, action) {
      const { conversationId, userId, username, isTyping } = action.payload;
      if (!state.typingIndicators[conversationId]) {
        state.typingIndicators[conversationId] = {};
      }
      // Store more info if needed, e.g., username
      state.typingIndicators[conversationId][userId] = { isTyping, username }; 
      // Clean up users who stopped typing
      if (!isTyping) {
        delete state.typingIndicators[conversationId][userId];
      }
    },
    addReaction(state, action) {
      const reaction = action.payload;
      const messageId = String(reaction.messageId);
      if (!state.reactions[messageId]) {
        state.reactions[messageId] = [];
      }
      // Avoid duplicate reactions from the same user
      if (!state.reactions[messageId].some((r) => r.id === reaction.id || (String(r.userId) === String(reaction.userId) && r.emoji === reaction.emoji))) {
        state.reactions[messageId].push(reaction);
      }
    },
    removeReaction(state, action) {
      const { messageId, emoji, userId } = action.payload;
      const msgId = String(messageId);
      if (state.reactions[msgId]) {
        state.reactions[msgId] = state.reactions[msgId].filter(
          (r) => !(r.emoji === emoji && String(r.userId) === String(userId))
        );
      }
    },
    // This reducer adds incoming WebRTC signals (offer, answer, candidate) to the state.
    // IMPORTANT: Dedicated WebRTC logic (hooks, services, or components) must observe 
    // this 'callSignals' array, process each signal based on its 'type' 
    // (e.g., call peerConnection.setRemoteDescription for offers/answers, 
    // peerConnection.addIceCandidate for candidates), and likely remove the processed signal from the array.
    addCallSignal(state, action) {
      const signal = action.payload;
      // Add a unique temporary ID if backend doesn't provide one, useful for key prop
      const signalId = signal.id || `signal-${Date.now()}-${Math.random()}`;
      // Avoid duplicates if possible, though signal content might be the same
      if (!state.callSignals.some((s) => s.id === signalId)) { 
        state.callSignals.push({ ...signal, id: signalId });
      }
    },
    // Optionally, add a reducer to remove processed signals
    removeCallSignal(state, action) {
        const signalIdToRemove = action.payload; // Expecting signalId
        state.callSignals = state.callSignals.filter(signal => signal.id !== signalIdToRemove);
    },
    // Sets the active call state, typically triggered by an incoming call notification
    setActiveCall(state, action) {
      // Ensure payload is structured consistently
      state.activeCall = action.payload ? { 
          callId: String(action.payload.callId),
          initiatorId: String(action.payload.initiatorId),
          conversationId: String(action.payload.conversationId),
          type: action.payload.type || 'UNKNOWN',
          status: action.payload.status || 'RINGING', // e.g., RINGING, CONNECTED, FAILED
          // Add any other relevant call info here
      } : null;
    },
    // Updates the status of the active call (e.g., CONNECTED, FAILED, ENDED)
    updateActiveCallStatus(state, action) {
        if (state.activeCall && state.activeCall.callId === String(action.payload.callId)) {
            state.activeCall.status = action.payload.status;
        }
    },
    // Clears the active call state (e.g., when call ends or is rejected)
    clearActiveCall(state) {
      state.activeCall = null;
    },
    addNotification(state, action) {
      const notification = action.payload;
      const notificationId = String(notification.id);
      if (!state.notifications.some((n) => String(n.id) === notificationId)) {
        state.notifications.unshift({ // Prepend to show newest first
          ...notification,
          id: notificationId,
          metadata: notification.metadata || {},
          read: notification.read || false, // Ensure read status exists
          createdAt: notification.createdAt || new Date().toISOString(), // Ensure timestamp exists
        });
      }
    },
    markNotificationAsRead(state, action) {
      const notificationId = String(action.payload);
      const notification = state.notifications.find((n) => String(n.id) === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead(state) {
        state.notifications.forEach(n => n.read = true);
    },
    setChatError(state, action) {
      state.error = action.payload;
    },
    clearChatError(state) {
        state.error = null;
    },
    // Clears the entire chat state, e.g., on logout
    clearChatState(state) {
      state.messages = [];
      state.typingIndicators = {};
      state.reactions = {};
      state.callSignals = [];
      state.notifications = [];
      state.activeCall = null;
      state.error = null;
    },
  },
});

export const {
  addMessage,
  setMessages,
  updateTypingIndicator,
  addReaction,
  removeReaction,
  addCallSignal,
  removeCallSignal, // Export the new reducer
  setActiveCall,
  updateActiveCallStatus, // Export the new reducer
  clearActiveCall,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead, // Export the new reducer
  setChatError,
  clearChatError, // Export the new reducer
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

