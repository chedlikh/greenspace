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
import {
  setMessages,
  addMessage,
  updateMessageStatus,
  setTypingIndicator,
  setMessagesError
} from '../features/messageSlice';
import { addConversation, updateConversation, removeConversation } from '../features/conversationSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
const SOCKET_URL = `${API_BASE_URL}/ws`;

const processedNotifications = new Set();
const processedMessages = new Set();

export const createStompClient = (token) => {
  const client = new Client({
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      console.log('STOMP: ' + str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.webSocketFactory = () => new SockJS(SOCKET_URL);
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
      dispatch(setMessagesError('WebSocket connection failed'));
    };

    stompClient.onWebSocketClose = () => {
      console.log('WebSocket connection closed, attempting to reconnect...');
      setConnected(false);
      dispatch(setNotificationsError('WebSocket connection closed'));
      dispatch(setMessagesError('WebSocket connection closed'));
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
    if (!client || !connected || !currentUser) {
      console.log('Skipping notification subscription: missing dependencies', { client, connected, currentUser });
      return;
    }

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
    }

    return () => {
      console.log('Cleaning up notification WebSocket subscriptions');
      Object.values(subscriptionRefs.current).forEach(sub => {
        if (sub) sub.unsubscribe();
      });
      subscriptionRefs.current = {};
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

export const useChatSubscription = (conversationId) => {
  const dispatch = useDispatch();
  const { client, connected } = useWebSocket();
  const currentUser = useSelector((state) => state.auth.user);
  const subscriptionRefs = useRef({});

  useEffect(() => {
    if (!client || !connected || !currentUser || !conversationId) {
      console.log('Skipping chat subscription: missing dependencies', { client, connected, currentUser, conversationId });
      return;
    }

    const fetchInitialMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${conversationId}?size=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const messages = (data.content || []).map(m => ({
            ...m,
            createdAt: m.sentDate,
            senderId: m.sender?.id,
            read: m.statuses?.some(s => s.status === 'READ' && s.user.id === currentUser.id) ?? false,
          })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          console.log('Initial messages:', messages);
          messages.forEach(m => {
            const id = String(m.id);
            if (processedMessages.has(id)) {
              console.log(`Duplicate initial message ID: ${id}`);
            } else {
              processedMessages.add(id);
            }
          });
          dispatch(setMessages({ conversationId, messages }));
        } else {
          console.error('Failed to fetch initial messages:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching initial messages:', error);
      }
    };

    fetchInitialMessages();

    if (!subscriptionRefs.current.messageSubscription) {
      console.log(`Creating WebSocket subscription for /topic/conversation/${conversationId}`);
      subscriptionRefs.current.messageSubscription = client.subscribe(
        `/topic/conversation/${conversationId}`,
        (message) => {
          try {
            const newMessage = JSON.parse(message.body);
            console.log('Received WebSocket message:', newMessage);
            const messageId = String(newMessage.id);
            if (processedMessages.has(messageId)) {
              console.log(`Skipping duplicate WebSocket message ID: ${messageId}`);
              return;
            }
            processedMessages.add(messageId);
            const normalizedMessage = {
              id: messageId,
              conversationId: String(newMessage.conversationId),
              content: newMessage.content || '',
              type: newMessage.type || 'TEXT',
              senderId: newMessage.sender?.id || newMessage.userId,
              createdAt: newMessage.sentDate || new Date().toISOString(),
              status: newMessage.status || 'SENT',
              read: newMessage.statuses?.some(s => s.status === 'READ' && s.user.id === currentUser.id) ?? false,
            };
            console.log('Dispatching addMessage:', normalizedMessage);
            dispatch(addMessage(normalizedMessage));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }
      );
    }

    if (!subscriptionRefs.current.typingSubscription) {
      console.log(`Creating WebSocket subscription for /topic/conversation/${conversationId}/typing`);
      subscriptionRefs.current.typingSubscription = client.subscribe(
        `/topic/conversation/${conversationId}/typing`,
        (message) => {
          try {
            const indicator = JSON.parse(message.body);
            console.log('Received typing indicator:', indicator);
            dispatch(setTypingIndicator({
              conversationId: indicator.conversationId,
              userId: indicator.user.id,
              firstname: indicator.user.firstname || 'Unknown',
              lastName: indicator.user.lastName || '',
              isTyping: indicator.typing // Use typing (boolean) from DTO
            }));
          } catch (error) {
            console.error('Error parsing typing indicator:', error);
          }
        }
      );
    }

    if (!subscriptionRefs.current.statusSubscription) {
      console.log(`Creating WebSocket subscription for /topic/conversation/${conversationId}/status`);
      subscriptionRefs.current.statusSubscription = client.subscribe(
        `/topic/conversation/${conversationId}/status`,
        (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log('Received status update:', update);
            if (update.messageId && update.status) {
              dispatch(updateMessageStatus({
                messageId: String(update.messageId),
                status: update.status,
              }));
            }
          } catch (error) {
            console.error('Error parsing status update:', error);
          }
        }
      );
    }

    if (!subscriptionRefs.current.conversationSubscription) {
      console.log(`Creating WebSocket subscription for /topic/conversation/${conversationId}`);
      subscriptionRefs.current.conversationSubscription = client.subscribe(
        `/topic/conversation/${conversationId}`,
        (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log('Received conversation update:', update);
            if (update.action === 'deleted') {
              dispatch(removeConversation(update.id));
            } else {
              dispatch(updateConversation(update));
            }
          } catch (error) {
            console.error('Error parsing conversation update:', error);
          }
        }
      );
    }

    if (!subscriptionRefs.current.userConversationSubscription) {
      console.log(`Creating WebSocket subscription for /user/queue/conversations`);
      subscriptionRefs.current.userConversationSubscription = client.subscribe(
        `/user/queue/conversations`,
        (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log('Received user conversation update:', update);
            if (update.action === 'new') {
              dispatch(addConversation(update.conversation));
            } else if (update.action === 'updated') {
              dispatch(updateConversation(update.conversation));
            } else if (update.action === 'deleted') {
              dispatch(removeConversation(update.conversationId));
            }
          } catch (error) {
            console.error('Error parsing user conversation update:', error);
          }
        }
      );
    }

    return () => {
      console.log('Cleaning up chat WebSocket subscriptions');
      Object.values(subscriptionRefs.current).forEach(sub => {
        if (sub) sub.unsubscribe();
      });
      subscriptionRefs.current = {};
    };
  }, [client, connected, currentUser, conversationId, dispatch]);

  return null;
};

export const useChatActions = () => {
  const { client, connected } = useWebSocket();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const sendMessage = (conversationId, content, type = 'TEXT') => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot send message: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Sending message to conversation ${conversationId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/send',
      body: JSON.stringify({
        conversationId: Number(conversationId),
        content,
        type,
        userId: String(currentUser.id),
        isEdited: false,
        isDeleted: false,
        isPinned: false,
      })
    });
  };

  const markMessageAsRead = (messageId, conversationId) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot mark message as read: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Marking message ${messageId} as read by user ${currentUser.id}`);
    dispatch(updateMessageStatus({ messageId: String(messageId), status: 'READ' }));
    
    client.publish({
      destination: '/app/status',
      body: JSON.stringify({
        messageId: Number(messageId),
        status: 'READ',
        user: { id: Number(currentUser.id) },
        conversationId: Number(conversationId),
      })
    });
  };

  const startTyping = (conversationId) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot send typing indicator: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Sending start typing for conversation ${conversationId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/typing/start',
      body: JSON.stringify({
        conversationId: Number(conversationId)
      })
    });
  };

  const stopTyping = (conversationId) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot send stop typing indicator: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Sending stop typing for conversation ${conversationId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/typing/stop',
      body: JSON.stringify({
        conversationId: Number(conversationId)
      })
    });
  };

  const createConversation = (createDTO) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot create conversation: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Creating conversation by user ${currentUser.id}`);
    client.publish({
      destination: '/app/conversation/create',
      body: JSON.stringify({
        ...createDTO,
        userId: String(currentUser.id),
      })
    });
  };

  const createDirectConversation = (otherUserId) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot create direct conversation: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Creating direct conversation with user ${otherUserId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/conversation/direct',
      body: JSON.stringify({
        userId: String(currentUser.id),
        otherUserId: Number(otherUserId),
      })
    });
  };

  const createGroupConversation = (groupDTO) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot create group conversation: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Creating group conversation by user ${currentUser.id}`);
    client.publish({
      destination: '/app/conversation/group',
      body: JSON.stringify({
        ...groupDTO,
        userId: String(currentUser.id),
      })
    });
  };

  const updateConversation = (conversationId, conversationDTO) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot update conversation: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Updating conversation ${conversationId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/conversation/update',
      body: JSON.stringify({
        ...conversationDTO,
        id: Number(conversationId),
        userId: String(currentUser.id),
      })
    });
  };

  const deleteConversation = (conversationId) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot delete conversation: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Deleting conversation ${conversationId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/conversation/delete',
      body: JSON.stringify({
        conversationId: Number(conversationId),
        userId: String(currentUser.id),
      })
    });
  };

  const addParticipant = (conversationId, userId, role) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot add participant: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Adding participant ${userId} to conversation ${conversationId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/conversation/participant/add',
      body: JSON.stringify({
        conversationId: Number(conversationId),
        userId: Number(userId),
        role,
        addedByUserId: String(currentUser.id),
      })
    });
  };

  const removeParticipant = (conversationId, userId) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot remove participant: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`Removing participant ${userId} from conversation ${conversationId} by user ${currentUser.id}`);
    client.publish({
      destination: '/app/conversation/participant/remove',
      body: JSON.stringify({
        conversationId: Number(conversationId),
        userId: Number(userId),
        removedByUserId: String(currentUser.id),
      })
    });
  };

  const leaveConversation = (conversationId) => {
    if (!client || !connected || !currentUser?.id) {
      console.warn('Cannot leave conversation: WebSocket not connected or user ID missing', {
        client: !!client,
        connected,
        userId: currentUser?.id,
      });
      return;
    }
    
    console.log(`User ${currentUser.id} leaving conversation ${conversationId}`);
    client.publish({
      destination: '/app/conversation/leave',
      body: JSON.stringify({
        conversationId: Number(conversationId),
        userId: String(currentUser.id),
      })
    });
  };

  return {
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
    createConversation,
    createDirectConversation,
    createGroupConversation,
    updateConversation,
    deleteConversation,
    addParticipant,
    removeParticipant,
    leaveConversation,
  };
};