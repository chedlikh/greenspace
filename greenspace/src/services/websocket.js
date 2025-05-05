// src/services/websocket.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead,
  setNotificationsError
} from '../features/notificationSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
const SOCKET_URL = `${API_BASE_URL}/ws`;

// Global Set to track processed notification IDs
const processedNotifications = new Set();

export const createStompClient = (token) => {
  const client = new Client({
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: function (str) {
      console.log('STOMP: ' + str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.webSocketFactory = () => {
    return new SockJS(SOCKET_URL);
  };

  return client;
};

export const useWebSocket = () => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const stompClient = createStompClient(token);
    clientRef.current = stompClient;

    stompClient.onConnect = () => {
      setConnected(true);
      console.log('Connected to WebSocket');
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setConnected(false);
      dispatch(setNotificationsError('WebSocket connection failed'));
    };

    stompClient.onWebSocketClose = () => {
      console.log('WebSocket connection closed, attempting to reconnect...');
      setConnected(false);
      dispatch(setNotificationsError('WebSocket connection closed'));
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient && stompClient.active) {
        console.log('Deactivating WebSocket client');
        stompClient.deactivate();
      }
    };
  }, [token, dispatch]);

  return { client: clientRef.current, connected };
};

export const useNotificationSubscription = () => {
  const dispatch = useDispatch();
  const { client, connected } = useWebSocket();
  const currentUser = useSelector((state) => state.auth.user);
  const subscriptionRefs = useRef({});

  useEffect(() => {
    // Early return if not logged in or not connected
    if (!client || !connected || !currentUser) {
      console.log('Skipping subscription: client, connected, or currentUser missing', { client, connected, currentUser });
      return;
    }

    // Fetch initial notifications via REST API
    const fetchInitialNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/notifications/user/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Initial notifications:', data);
          data.forEach(n => {
            const id = String(n.id);
            if (processedNotifications.has(id)) {
              console.log(`Duplicate initial notification ID: ${id}`);
            } else {
              processedNotifications.add(id);
            }
          });
          dispatch(setNotifications(data));
        } else {
          console.error('Failed to fetch initial notifications:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching initial notifications:', error);
      }
    };

    fetchInitialNotifications();

    // Subscribe to notification updates
    if (!subscriptionRefs.current.updateSubscription) {
      console.log('Creating WebSocket subscription for /user/queue/notifications-update');
      subscriptionRefs.current.updateSubscription = client.subscribe(
        `/user/queue/notifications-update`,
        (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log('Received WebSocket update:', update);
            if (update.type === 'new-notification' && update.notification) {
              const notificationId = String(update.notification.id);
              if (processedNotifications.has(notificationId)) {
                console.log(`Skipping duplicate WebSocket notification ID: ${notificationId}`);
                return;
              }
              processedNotifications.add(notificationId);
              const normalizedNotification = {
                id: notificationId,
                message: update.notification.message || 'No message available',
                type: update.notification.type || 'NOTIFICATION',
                read: update.notification.isRead ?? false,
                createdAt: update.notification.createdAt || new Date().toISOString(),
              };
              console.log('Dispatching addNotification:', normalizedNotification);
              dispatch(addNotification(normalizedNotification));
            } else if (update.type === 'marked-read' && update.notificationId) {
              dispatch(markAsRead(update.notificationId));
            } else if (update.type === 'marked-all-read') {
              dispatch(markAllAsRead());
            } else {
              console.warn('Unhandled WebSocket update type:', update.type);
            }
          } catch (error) {
            console.error('Error parsing notification update:', error);
          }
        }
      );
    } else {
      console.log('WebSocket subscription already exists, skipping creation');
    }

    return () => {
      console.log('Cleaning up WebSocket subscriptions');
      Object.values(subscriptionRefs.current).forEach(sub => {
        if (sub) sub.unsubscribe();
      });
      subscriptionRefs.current = {};
      // Do NOT clear processedNotifications to prevent re-processing
    };
  }, [client, connected, currentUser, dispatch]);

  return null;
};

export const useNotificationActions = () => {
  const { client, connected } = useWebSocket();
  const dispatch = useDispatch();
  
  const markNotificationAsRead = (notificationId) => {
    if (!client || !connected) {
      console.warn('Cannot mark notification as read: WebSocket not connected');
      return;
    }
    
    console.log(`Marking notification ${notificationId} as read`);
    dispatch(markAsRead(notificationId));
    
    client.publish({
      destination: '/app/notifications.mark-read',
      body: JSON.stringify(notificationId)
    });
  };
  
  const markAllNotificationsAsRead = () => {
    if (!client || !connected) {
      console.warn('Cannot mark all notifications as read: WebSocket not connected');
      return;
    }
    
    console.log('Marking all notifications as read');
    dispatch(markAllAsRead());
    
    client.publish({
      destination: '/app/notifications.mark-all-read',
      body: ''
    });
  };
  
  return { markAsRead: markNotificationAsRead, markAllAsRead: markAllNotificationsAsRead };
};
