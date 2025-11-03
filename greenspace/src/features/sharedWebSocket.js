import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setNotifications,
  addNotification as addNotificationAction, // Renamed to avoid conflict
  markAsRead,
  markAllAsRead as markAllNotificationsAsReadAction, // Use action name from slice
  setNotificationsError,
} from './notificationSlice'; // Assuming path is correct
import {
  addMessage,
  updateTypingIndicator,
  addReaction,
  addCallSignal, // Action to add signal to state
  setActiveCall, // Action to set incoming/active call state
  updateActiveCallStatus, // Action to update call status (e.g., CONNECTED, ENDED)
  clearActiveCall, // Action to clear call state
  setChatError,
  clearChatError, // Added action from corrected slice
} from './chatSlice'; // Assuming path is correct

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';
const SOCKET_URL = `${API_BASE_URL}/ws`;

// Use Sets for efficient duplicate checking
const processedNotifications = new Set();
const processedMessages = new Set();

// Function to create the STOMP client instance
export const createSharedWebSocketClient = (token) => {
  return new Client({
    connectHeaders: { Authorization: `Bearer ${token}` },
    debug: (str) => process.env.NODE_ENV === 'development' && console.log('STOMP:', str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    webSocketFactory: () => new SockJS(SOCKET_URL),
  });
};

// The main hook managing the shared WebSocket connection and subscriptions
export const useSharedWebSocket = (conversationId = null) => {
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);
  // Get active call state to potentially manage topic subscriptions
  const activeCall = useSelector((state) => state.chat.activeCall); 
  const dispatch = useDispatch();

  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const subscriptionRefs = useRef({});
  const prevConversationIdRef = useRef(null);

  // --- Normalization Functions --- 
  const normalizeMessage = useCallback((msg) => ({
    ...msg,
    id: String(msg.id),
    attachments: msg.attachments || [],
    statuses: msg.statuses || [],
    reactions: msg.reactions || [],
    sender: msg.sender || { id: null, username: '' },
    sentDate: msg.sentDate || new Date().toISOString(),
  }), []);

  const normalizeNotification = useCallback((data) => {
    // Handle specific sondage structure if necessary
    if (data.sondageId !== undefined) {
      return {
        id: String(data.id || `sondage-${Date.now()}`),
        type: 'SONDAGE',
        message: data.message || 'New sondage notification',
        userId: String(data.recipient?.id || currentUser?.id || ''),
        read: data.isRead || false,
        createdAt: data.createdAt || new Date().toISOString(),
        metadataId: String(data.sondageId || ''),
        metadata: { sondageId: data.sondageId },
      };
    }
    // General notification structure
    return {
      id: String(data.id || `notif-${Date.now()}`),
      type: data.type || 'UNKNOWN',
      message: data.message || 'New notification',
      userId: String(data.userId || currentUser?.id || ''),
      read: data.read || false,
      createdAt: data.createdAt || new Date().toISOString(),
      metadataId: String(data.metadataId || ''),
      metadata: data.metadata || {},
    };
  }, [currentUser]);

  // --- Message Handlers --- 
  const handleMessage = useCallback((message) => {
    try {
      const msg = normalizeMessage(JSON.parse(message.body));
      const messageId = String(msg.id);
      if (processedMessages.has(messageId)) {
        console.log(`Skipping duplicate message ID: ${messageId}`);
        return;
      }
      processedMessages.add(messageId);
      // Add short-term cache cleanup if needed
      setTimeout(() => processedMessages.delete(messageId), 60000); 
      dispatch(addMessage(msg));
    } catch (error) {
      console.error('Error parsing message:', error, message.body);
      dispatch(setChatError('Failed to process message'));
    }
  }, [dispatch, normalizeMessage]);

  const handleNotification = useCallback((message) => {
    try {
      console.log('Raw notification received:', message.body);
      const payload = JSON.parse(message.body);
      let notificationData;
      let notificationType;

      // Adapt based on actual backend payload structure
      if (payload.type && payload.data) { // Common pattern: { type: '...', data: {...} }
        notificationType = payload.type;
        notificationData = payload.data;
      } else { // Assume payload is the notification object itself
        notificationType = payload.type || 'UNKNOWN';
        notificationData = payload;
      }

      const notificationId = String(notificationData.id || `notif-${Date.now()}`);
      if (processedNotifications.has(notificationId)) {
        console.log(`Skipping duplicate notification ID: ${notificationId}`);
        return;
      }
      processedNotifications.add(notificationId);
      // Add short-term cache cleanup if needed
      setTimeout(() => processedNotifications.delete(notificationId), 60000);

      // Dispatch based on type
      if (['SYSTEM', 'CHAT', 'CALL', 'SONDAGE'].includes(notificationType)) {
        const normalized = normalizeNotification(notificationData);
        dispatch(addNotificationAction(normalized)); // Use renamed action
        console.log('Notification processed:', normalized);
      } else if (notificationType === 'READ') {
        dispatch(markAsRead(String(notificationData.id)));
      } else if (notificationType === 'READ_ALL') {
        dispatch(markAllNotificationsAsReadAction()); // Use renamed action
      } else {
        console.warn('Unhandled notification type:', notificationType, notificationData);
      }
    } catch (error) {
      console.error('Error parsing notification:', error, message.body);
      dispatch(setNotificationsError('Failed to process notification'));
    }
  }, [dispatch, normalizeNotification]);

  // Handles incoming call invitations from /user/{id}/queue/call
  const handleCallInvitation = useCallback((message) => {
    try {
      console.log('Call invitation received:', message.body);
      const callDTO = JSON.parse(message.body);
      
      if (!callDTO.id || !callDTO.initiatedBy?.id || !callDTO.conversationId) {
        console.error('Call invitation missing required fields (id, initiatedBy.id, conversationId):', callDTO);
        return;
      }
      
      const callData = {
        callId: String(callDTO.id),
        initiatorId: String(callDTO.initiatedBy.id),
        conversationId: String(callDTO.conversationId),
        type: callDTO.type || 'VIDEO', // Default to VIDEO if type is missing
        status: callDTO.status || 'RINGING', // Should be RINGING for invitation
      };

      // Dispatch action to set this as the active (incoming) call
      dispatch(setActiveCall(callData));
      console.log('Active call set from invitation:', callData);

      // Optionally, create a user-facing notification as well
      const notificationId = `call-invite-${callData.callId}`;
      if (!processedNotifications.has(notificationId)) {
          processedNotifications.add(notificationId);
          setTimeout(() => processedNotifications.delete(notificationId), 60000);
          dispatch(addNotificationAction({
            id: notificationId,
            type: 'CALL',
            message: `Incoming ${callData.type.toLowerCase()} call from user ${callData.initiatorId}`,
            userId: String(currentUser.id),
            read: false,
            createdAt: new Date().toISOString(),
            metadata: { ...callData }, // Include all call details in metadata
          }));
          console.log('Call invitation notification created:', notificationId);
      }

    } catch (error) {
      console.error('Error parsing call invitation:', error, message.body);
      dispatch(setChatError('Failed to process call invitation'));
    }
  }, [dispatch, currentUser]);

  // Handles incoming WebRTC signals (offer, answer, candidate) from /user/{id}/queue/call/signal
  const handleCallSignal = useCallback((message) => {
    try {
      const signal = JSON.parse(message.body);
      console.log('Received WebRTC signal:', signal);
      // Basic validation
      if (!signal.type || !signal.callId || !signal.fromUserId) {
          console.error('Invalid signal received:', signal);
          return;
      }
      // Dispatch action to add signal to Redux state.
      // The actual WebRTC logic (RTCPeerConnection handling) must be implemented
      // in components/hooks that select state.chat.callSignals.
      dispatch(addCallSignal({ 
          ...signal, 
          id: `signal-${signal.type}-${Date.now()}` // Add a temporary unique ID
      }));
    } catch (error) {
      console.error('Error parsing call signal:', error, message.body);
      dispatch(setChatError('Failed to process call signal'));
    }
  }, [dispatch]);

  // --- Subscription Management --- 

  // Effect to manage conversation-specific subscriptions
  useEffect(() => {
    if (!clientRef.current || !connected || !currentUser) return;

    // If conversationId changes, unsubscribe from old topics
    if (prevConversationIdRef.current !== conversationId) {
      console.log(`Conversation changed from ${prevConversationIdRef.current} to ${conversationId}. Updating subscriptions.`);
      ['messageSubscription', 'typingSubscription', 'reactionSubscription'].forEach((subKey) => {
        if (subscriptionRefs.current[subKey]) {
          try {
            subscriptionRefs.current[subKey].unsubscribe();
            console.log(`Unsubscribed from ${subKey} for conversation ${prevConversationIdRef.current}`);
          } catch (e) { console.error(`Error unsubscribing ${subKey}:`, e); }
          delete subscriptionRefs.current[subKey];
        }
      });

      // Subscribe to new conversation topics if conversationId is valid
      if (conversationId) {
        try {
          subscriptionRefs.current.messageSubscription = clientRef.current.subscribe(
            `/topic/conversation/${conversationId}`,
            handleMessage
          );
          console.log(`Subscribed to messages for conversation ${conversationId}`);

          subscriptionRefs.current.typingSubscription = clientRef.current.subscribe(
            `/topic/conversation/${conversationId}/typing`,
            (message) => {
              try {
                const typingIndicator = JSON.parse(message.body);
                dispatch(
                  updateTypingIndicator({
                    conversationId: String(typingIndicator.conversationId),
                    userId: String(typingIndicator.user?.id),
                    username: typingIndicator.user?.username || 'Unknown',
                    isTyping: typingIndicator.isTyping,
                  })
                );
              } catch (error) {
                console.error('Error parsing typing indicator:', error, message.body);
                dispatch(setChatError('Failed to process typing indicator'));
              }
            }
          );
          console.log(`Subscribed to typing for conversation ${conversationId}`);

          subscriptionRefs.current.reactionSubscription = clientRef.current.subscribe(
            `/topic/conversation/${conversationId}/reaction`,
            (message) => {
              try {
                const reaction = JSON.parse(message.body);
                dispatch(addReaction(reaction));
              } catch (error) {
                console.error('Error parsing reaction:', error, message.body);
                dispatch(setChatError('Failed to process reaction'));
              }
            }
          );
          console.log(`Subscribed to reactions for conversation ${conversationId}`);
        } catch (error) {
            console.error(`Failed to subscribe to conversation ${conversationId} topics:`, error);
            dispatch(setChatError(`Subscription error for conversation ${conversationId}`));
        }
      }
      prevConversationIdRef.current = conversationId;
    }
  }, [conversationId, connected, currentUser, dispatch, handleMessage]);

  // Effect to manage global (user-specific) subscriptions and connection lifecycle
  useEffect(() => {
    if (!token || !currentUser?.id) {
      console.log('WebSocket: No token or user ID, skipping connection.');
      // Ensure cleanup if client exists but token/user disappears
      if (clientRef.current && clientRef.current.active) {
          try { clientRef.current.deactivate(); } catch(e) { console.error("Error deactivating client:", e); }
          clientRef.current = null;
          setClient(null);
          setConnected(false);
          subscriptionRefs.current = {};
      }
      return;
    }

    // Avoid reconnecting if already connected
    if (clientRef.current && clientRef.current.active) {
        console.log('WebSocket: Already active/connected.');
        // Ensure state reflects reality
        if (!client) setClient(clientRef.current);
        if (!connected) setConnected(true);
        return;
    }

    console.log('WebSocket: Attempting to connect...');
    const stompClient = createSharedWebSocketClient(token);
    clientRef.current = stompClient;
    setClient(stompClient);

    stompClient.onConnect = () => {
      setConnected(true);
      console.log(`WebSocket: Connected. User ID: ${currentUser.id}`);
      clearTimeout(reconnectTimeoutRef.current); // Clear any pending reconnect timeout

      // --- Subscribe to user-specific queues --- 
      const userId = currentUser.id;
      const userQueuePrefix = `/user/${userId}/queue`; // Use user-specific prefix

      // General Notifications
      if (!subscriptionRefs.current.notificationSubscription) {
        try {
            subscriptionRefs.current.notificationSubscription = stompClient.subscribe(
              `${userQueuePrefix}/notifications`, // Standard notification queue
              handleNotification
            );
            console.log(`Subscribed to: ${userQueuePrefix}/notifications`);
        } catch (e) { console.error("Subscription error (notifications):", e); }
      }
      
      // Private Messages (Direct messages or specific updates)
      if (!subscriptionRefs.current.privateMessageSubscription) {
        try {
            subscriptionRefs.current.privateMessageSubscription = stompClient.subscribe(
              `${userQueuePrefix}/messages`, 
              handleMessage
            );
            console.log(`Subscribed to: ${userQueuePrefix}/messages`);
        } catch (e) { console.error("Subscription error (private messages):", e); }
      }

      // Call Invitations
      if (!subscriptionRefs.current.callInvitationSubscription) {
        try {
            subscriptionRefs.current.callInvitationSubscription = stompClient.subscribe(
              `${userQueuePrefix}/call`, // Queue for incoming call DTOs
              handleCallInvitation
            );
            console.log(`Subscribed to: ${userQueuePrefix}/call`);
        } catch (e) { console.error("Subscription error (call invitations):", e); }
      }

      // WebRTC Signaling (Offers, Answers, Candidates)
      if (!subscriptionRefs.current.callSignalSubscription) {
        try {
            subscriptionRefs.current.callSignalSubscription = stompClient.subscribe(
              `${userQueuePrefix}/call/signal`, // Queue for WebRTC signals
              handleCallSignal
            );
            console.log(`Subscribed to: ${userQueuePrefix}/call/signal`);
        } catch (e) { console.error("Subscription error (call signals):", e); }
      }
      
      // --- Subscribe to general call updates (topic) --- 
      // This subscription should ideally be managed based on whether a call is active.
      // Subscribing here means it's always active, which might not be efficient.
      // Consider moving this logic to a component/hook managing the active call UI.
      /*
      if (activeCall?.callId && !subscriptionRefs.current.callUpdateSubscription) {
          const callTopic = `/topic/call/${activeCall.callId}`;
          try {
              subscriptionRefs.current.callUpdateSubscription = stompClient.subscribe(
                  callTopic,
                  (message) => {
                      try {
                          const update = JSON.parse(message.body);
                          console.log('Received call update:', update);
                          // Dispatch action to update call state based on eventType/data
                          // Example: dispatch(updateActiveCallStatus({ callId: activeCall.callId, status: update.eventType }));
                          // Example: dispatch(handleParticipantUpdate(update.data));
                      } catch (error) {
                          console.error('Error parsing call update:', error, message.body);
                      }
                  }
              );
              console.log(`Subscribed to: ${callTopic}`);
          } catch (e) { console.error(`Subscription error (${callTopic}):`, e); }
      } else if (!activeCall?.callId && subscriptionRefs.current.callUpdateSubscription) {
          // Unsubscribe if call becomes inactive
          try {
              subscriptionRefs.current.callUpdateSubscription.unsubscribe();
              delete subscriptionRefs.current.callUpdateSubscription;
              console.log(`Unsubscribed from: /topic/call/${activeCall?.callId}`);
          } catch (e) { console.error('Error unsubscribing call update:', e); }
      }
      */
    };

    stompClient.onDisconnect = () => {
      setConnected(false);
      console.log('WebSocket: Disconnected.');
      // Clear subscriptions on disconnect
      subscriptionRefs.current = {}; 
    };

    stompClient.onStompError = (frame) => {
      console.error('WebSocket STOMP Error:', frame.headers['message'], frame.body);
      setConnected(false);
      dispatch(setChatError(`WebSocket connection error: ${frame.headers['message']}`));
      // Attempt to reconnect after a delay
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
          console.log('WebSocket: Attempting to reconnect after STOMP error...');
          if (clientRef.current && !clientRef.current.active) {
              clientRef.current.activate();
          }
      }, 5000); 
    };
    
    stompClient.onWebSocketError = (event) => {
        console.error('WebSocket Native Error:', event);
        setConnected(false);
        dispatch(setChatError('WebSocket transport error.'));
        // Reconnect logic might be handled by stompjs reconnectDelay, but can add explicit logic here too
    };

    stompClient.activate();

    // Cleanup function on component unmount or dependency change
    return () => {
      console.log('WebSocket: Cleaning up connection.');
      clearTimeout(reconnectTimeoutRef.current);
      if (clientRef.current && clientRef.current.active) {
        try {
          // Unsubscribe from all topics/queues before deactivating
          Object.values(subscriptionRefs.current).forEach((sub) => {
            if (sub?.unsubscribe) { 
              try { sub.unsubscribe(); } catch(e) { console.error("Error during unsubscribe:", e); }
            }
          });
          subscriptionRefs.current = {};
          clientRef.current.deactivate();
          console.log('WebSocket: Deactivated successfully.');
        } catch (error) {
          console.error('Error deactivating WebSocket client:', error);
        }
      }
      clientRef.current = null;
      setClient(null);
      setConnected(false);
    };
  // Rerun effect if token or user ID changes
  }, [token, currentUser?.id, dispatch, handleMessage, handleNotification, handleCallInvitation, handleCallSignal]); 

  // --- Actions to Send Messages --- 
  // These should ideally use the clientRef.current directly

  const publish = useCallback((destination, body) => {
      if (!clientRef.current || !clientRef.current.connected) {
          console.warn(`Cannot publish to ${destination}: WebSocket not connected.`);
          dispatch(setChatError('Cannot send message: Not connected'));
          return false;
      }
      try {
          clientRef.current.publish({ destination, body: JSON.stringify(body) });
          console.log(`Published to ${destination}:`, body);
          dispatch(clearChatError()); // Clear error on successful publish
          return true;
      } catch (error) {
          console.error(`Failed to publish to ${destination}:`, error);
          dispatch(setChatError(`Failed to send: ${error.message}`));
          return false;
      }
  }, [dispatch]); // Depends only on dispatch

  const sendMessage = useCallback((conversationId, message) => {
    return publish('/app/chat.message', { conversationId: String(conversationId), ...message });
  }, [publish]);

  const sendTypingStatus = useCallback((conversationId, isTyping) => {
    return publish('/app/chat.typing', { conversationId: String(conversationId), isTyping });
  }, [publish]);

  const addReaction = useCallback((messageId, emoji) => {
    return publish('/app/chat.reaction', { messageId: String(messageId), emoji });
  }, [publish]);

  const sendWebRTCSignal = useCallback((destination, payload) => {
      if (!currentUser?.id) {
          console.warn(`Cannot send WebRTC signal to ${destination}: Missing current user ID.`);
          return false;
      }
      // Ensure IDs are strings and payload is structured correctly
      const body = {
          ...payload,
          callId: String(payload.callId),
          fromUserId: String(currentUser.id),
          toUserId: String(payload.toUserId),
          // Ensure offer/answer/candidate are properly stringified if they are objects
          offer: typeof payload.offer === 'object' ? JSON.stringify(payload.offer) : payload.offer,
          answer: typeof payload.answer === 'object' ? JSON.stringify(payload.answer) : payload.answer,
          candidate: typeof payload.candidate === 'object' ? JSON.stringify(payload.candidate) : payload.candidate,
      };
      return publish(destination, body);
  }, [publish, currentUser?.id]);

  const sendWebRTCOffer = useCallback((callId, toUserId, offer) => {
    return sendWebRTCSignal('/app/webrtc.offer', { callId, toUserId, offer });
  }, [sendWebRTCSignal]);

  const sendWebRTCAnswer = useCallback((callId, toUserId, answer) => {
    return sendWebRTCSignal('/app/webrtc.answer', { callId, toUserId, answer });
  }, [sendWebRTCSignal]);

  const sendICECandidate = useCallback((callId, toUserId, candidate) => {
    return sendWebRTCSignal('/app/webrtc.ice', { callId, toUserId, candidate });
  }, [sendWebRTCSignal]);

  // Return the state and actions provided by the hook
  return {
    client: client, // The STOMP client instance (can be null)
    connected, // Boolean indicating connection status
    // Actions for sending messages/signals
    sendMessage,
    sendTypingStatus,
    addReaction,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendICECandidate,
  };
};

