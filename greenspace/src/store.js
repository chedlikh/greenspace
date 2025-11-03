import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import notificationReducer from './features/notificationSlice';
import themeReducer from './features/themeSlice';
import messageReducer from './features/messageSlice'; // Add this import
import conversationReducer from './features/conversationSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    theme: themeReducer,
    messages: messageReducer, // Add message reducer
    conversations: conversationReducer,

  },
});