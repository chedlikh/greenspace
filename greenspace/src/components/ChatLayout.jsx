// src/components/ChatLayout.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { useWebSocketContext } from '../features/WebSocketProvider';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import ChatManager from './ChatManager';

const ChatLayout = ({ showConversationListOnly = false }) => {
  const { darkMode } = useSelector((state) => state.theme);
  const { connected } = useWebSocketContext();

  return (
    <div className={`flex min-h-[calc(100vh-60px)] ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`flex flex-1 ${showConversationListOnly ? 'flex-col' : 'flex-row'} pt-[100px] ${showConversationListOnly ? '' : ''}`}>
        {/* ConversationList: Hidden on mobile unless showConversationListOnly, 1/3 width on desktop */}
        <div className={`w-full md:w-1/3 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${showConversationListOnly ? '' : 'hidden md:block'}`}>
          <ConversationList />
        </div>
        {/* MessageList: Full width on mobile, 2/3 width on desktop */}
        <div className={`flex-1 ${showConversationListOnly ? 'hidden' : ''}`}>
          <ChatManager />
          <MessageList />
          {!connected && (
            <div className={`text-center p-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} bg-red-100 dark:bg-red-900/30`}>
              WebSocket disconnected. Please refresh to reconnect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;