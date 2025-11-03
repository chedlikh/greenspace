// src/services/websocketChat.js
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './websocket';
import { useSelector } from 'react-redux';
import { messageKeys } from './messageHooks';

export const useChatSubscription = (conversationId) => {
  const { stompClient, isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('[useChatSubscription] Initializing effect', {
      conversationId,
      isConnected,
      hasStompClient: !!stompClient,
      stompClientMethods: stompClient ? Object.keys(stompClient) : [],
      userId: user?.id,
      username: user?.username,
    });

    if (!conversationId) {
      console.warn('[useChatSubscription] No conversationId, skipping subscriptions');
      return;
    }

    if (!user || !user.id) {
      console.warn('[useChatSubscription] No authenticated user, skipping subscriptions');
      return;
    }

    if (!isConnected || !stompClient || typeof stompClient.subscribe !== 'function') {
      console.warn ('[useChatSubscription] WebSocket not ready or invalid'), {
        isConnected,
        hasStompClient: !!stompClient,
        hasSubscribe: !!stompClient?.subscribe,
      }
      return;
    }

    console.log('[useChatSubscription] Setting up subscriptions for conversation', conversationId);

    // Subscribe to messages
    let messageSubscription;
    try {
      messageSubscription = stompClient.subscribe(
        `/topic/conversation/${conversationId}`,
        (message) => {
          console.log('[useChatSubscription] Message received', {
            topic: `/topic/conversation/${conversationId}`,
            body: message.body,
          });
          try {
            const newMessage = JSON.parse(message.body);
            console.log('[useChatSubscription] Parsed message', newMessage);

            if (!newMessage.id) {
              console.warn('[useChatSubscription] Message missing id', newMessage);
              return;
            }

            queryClient.setQueryData(messageKeys.list(conversationId), (oldData) => {
              console.log('[useChatSubscription] Updating cache', { oldData });
              if (!oldData || !oldData.pages) {
                return { pages: [{ content: [newMessage], last: false }], pageParams: [0] };
              }
              const newPages = [...oldData.pages];
              newPages[0] = {
                ...newPages[0],
                content: [newMessage, ...newPages[0].content.filter((msg) => String(msg.id) !== String(newMessage.id))],
              };
              return { ...oldData, pages: newPages };
            });

            console.log('[useChatSubscription] Invalidating messages query');
            queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId), exact: true });
          } catch (error) {
            console.error('[useChatSubscription] Error parsing message', {
              error: error.message,
              rawBody: message.body,
            });
          }
        },
        {}
      );
      console.log('[useChatSubscription] Message subscription active', { subscriptionId: messageSubscription.id });
    } catch (error) {
      console.error('[useChatSubscription] Failed to subscribe to messages', error);
    }

    // Subscribe to typing indicators
    let typingSubscription;
    try {
      typingSubscription = stompClient.subscribe(
        `/topic/conversation/${conversationId}/typing`,
        (message) => {
          console.log('[useChatSubscription] Typing indicator received', {
            topic: `/topic/conversation/${conversationId}/typing`,
            body: message.body,
          });
          try {
            const typingIndicator = JSON.parse(message.body);
            console.log('[useChatSubscription] Parsed typing indicator', typingIndicator);

            if (!typingIndicator.user?.id || !typingIndicator.user?.username) {
              console.warn('[useChatSubscription] Invalid typing indicator data', typingIndicator);
              return;
            }

            if (String(typingIndicator.user.id) === String(user.id)) {
              console.log('[useChatSubscription] Ignoring own typing event', typingIndicator);
              return;
            }

            setTypingUsers((prev) => {
              if (typingIndicator.isTyping) {
                if (!prev.find((u) => String(u.userId) === String(typingIndicator.user.id))) {
                  console.log('[useChatSubscription] Adding typing user', typingIndicator.user);
                  return [...prev, { userId: typingIndicator.user.id, username: typingIndicator.user.username }];
                }
                return prev;
              } else {
                const updated = prev.filter((u) => String(u.userId) !== String(typingIndicator.user.id));
                console.log('[useChatSubscription] Removed typing user', {
                  userId: typingIndicator.user.id,
                  remaining: updated,
                });
                return updated;
              }
            });
          } catch (error) {
            console.error('[useChatSubscription] Error parsing typing indicator', {
              error: error.message,
              rawBody: message.body,
            });
          }
        },
        {}
      );
      console.log('[useChatSubscription] Typing subscription active', { subscriptionId: typingSubscription.id });
    } catch (error) {
      console.error('[useChatSubscription] Failed to subscribe to typing indicators', error);
    }

    return () => {
      console.log('[useChatSubscription] Cleaning up subscriptions for conversation', conversationId);
      try {
        if (messageSubscription) {
          messageSubscription.unsubscribe();
          console.log('[useChatSubscription] Unsubscribed from messages');
        }
      } catch (error) {
        console.error('[useChatSubscription] Error unsubscribing from messages', error);
      }
      try {
        if (typingSubscription) {
          typingSubscription.unsubscribe();
          console.log('[useChatSubscription] Unsubscribed from typing indicators');
        }
      } catch (error) {
        console.error('[useChatSubscription] Error unsubscribing from typing indicators', error);
      }
      setTypingUsers([]);
      console.log('[useChatSubscription] Cleared typing users');
    };
  }, [isConnected, stompClient, conversationId, queryClient, user]);

  console.log('[useChatSubscription] Current state', { typingUsers });

  return { typingUsers };
};