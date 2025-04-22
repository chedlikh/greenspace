// src/features/WebSocketProvider.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { useWebSocket } from '../services/websocket';

const WebSocketContext = createContext(null);

export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const websocketData = useWebSocket();

  useEffect(() => {
    console.log('WebSocketProvider rendered:', Date.now());
  });

  return (
    <WebSocketContext.Provider value={websocketData}>
      {children}
    </WebSocketContext.Provider>
  );
};