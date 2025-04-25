import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNotificationSubscription } from '../services/websocket';

const NotificationManager = () => {
  const { token, user } = useSelector((state) => state.auth);
  const isLoggedIn = !!token && !!user;
  
  // Always call the hook, but handle the conditional logic inside
  const subscriptionResult = useNotificationSubscription();
  
  // No rendering needed
  return null;
};

export default NotificationManager;