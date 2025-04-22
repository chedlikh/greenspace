
import React from 'react';
import { useSelector } from 'react-redux';
import { useNotificationSubscription } from '../services/websocket';

const NotificationManager = () => {
  const { token, user } = useSelector((state) => state.auth);
  const isLoggedIn = !!token && !!user;

  // Only subscribe to notifications if the user is logged in
  if (isLoggedIn) {
    useNotificationSubscription();
  }

  // This component doesn't render anything
  return null;
};

export default NotificationManager;