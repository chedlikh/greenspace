// src/features/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action) {
      const newNotifications = action.payload.filter(
        (n) => !state.notifications.some((existing) => String(existing.id) === String(n.id))
      );
      state.notifications = [...newNotifications, ...state.notifications];
      state.unreadCount = state.notifications.filter((n) => !n.read && !n.isRead).length;
      state.error = null;
    },
    addNotification(state, action) {
      const notificationId = String(action.payload.id);
      if (state.notifications.some((n) => String(n.id) === notificationId)) {
        console.log(`Duplicate notification ID ${notificationId} ignored in addNotification`);
        return;
      }
      state.notifications.unshift({
        ...action.payload,
        id: notificationId,
        read: action.payload.read ?? action.payload.isRead ?? false,
      });
      if (!action.payload.read && !action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.error = null;
    },
    markAsRead(state, action) {
      const notificationId = String(action.payload);
      const notification = state.notifications.find((n) => String(n.id) === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
    setNotificationsError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  clearNotifications,
  setNotificationsError 
} = notificationSlice.actions;

export default notificationSlice.reducer;