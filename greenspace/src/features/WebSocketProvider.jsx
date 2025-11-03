import React, { createContext, useContext, useEffect } from 'react';
import { useWebSocket, useChatActions, useNotificationActions } from '../services/websocket';

const WebSocketContext = createContext(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const websocketData = useWebSocket();
  const chatActions = useChatActions();
  const notificationActions = useNotificationActions();

  useEffect(() => {
    console.log('[WebSocketProvider] Rendered', {
      timestamp: Date.now(),
      isConnected: websocketData.connected,
      hasStompClient: !!websocketData.client,
    });
  }, [websocketData.connected, websocketData.client]);

  const contextValue = {
    ...websocketData,
    ...chatActions,
    ...notificationActions,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};