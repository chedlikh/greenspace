// src/components/MessageList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useWebSocketContext } from '../features/WebSocketProvider';
import { clearMessages } from '../features/messageSlice';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Trash2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const themeColors = {
  blue: { primary: '#0084FF', secondary: '#007BFF', gradient: 'from-[#0084FF] to-[#007BFF]' },
  green: { primary: '#00C853', secondary: '#00B248', gradient: 'from-[#00C853] to-[#00B248]' },
  purple: { primary: '#AB47BC', secondary: '#9C27B0', gradient: 'from-[#AB47BC] to-[#9C27B0]' },
};

const MessageItem = React.forwardRef(({ message, onMarkAsRead, theme, darkMode }, ref) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [isHovered, setIsHovered] = useState(false);

  const getThemeConfig = () => themeColors[theme] || themeColors.blue;
  const themeConfig = getThemeConfig();

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Just now' : formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Just now';
    }
  };

  if (!message) return null;

  const isOwnMessage = String(message.senderId) === String(currentUser?.id);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 my-1 max-w-[70%] ${
        isOwnMessage ? 'ml-auto justify-end' : 'mr-auto'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
          {message.sender?.firstname?.[0] || 'U'}
        </div>
      )}
      <div
        className={`relative p-2.5 rounded-2xl text-sm ${
          isOwnMessage
            ? `bg-gradient-to-br ${themeConfig.gradient} text-white`
            : `bg-${darkMode ? 'gray-700' : 'gray-100'} ${darkMode ? 'text-gray-200' : 'text-gray-900'}`
        }`}
      >
        <p className="break-words">{message.content || 'No content'}</p>
        {isHovered && (
          <div className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'} mt-4`}>
            {formatDate(message.createdAt)}
          </div>
        )}
        {!message.read && !isOwnMessage && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead?.(message.id);
            }}
            className={`absolute -top-1 -right-1 p-1 rounded-full bg-${themeConfig.primary} text-white`}
            aria-label="Mark message as read"
          >
            <CheckCircle className="w-3 h-3" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

const MessageList = () => {
  const { id: conversationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { messages, typingUsers } = useSelector(
    (state) => state.messages.conversations[conversationId] || { messages: [], typingUsers: [] }
  );
  const conversations = useSelector((state) => state.conversations.conversations);
  const currentUser = useSelector((state) => state.auth.user);
  const { theme, darkMode } = useSelector((state) => state.theme);
  const { sendMessage, markMessageAsRead, startTyping, stopTyping } = useWebSocketContext();
  const [newMessage, setNewMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messageContainerRef = useRef(null);

  const getThemeConfig = () => themeColors[theme] || themeColors.blue;
  const themeConfig = getThemeConfig();

  // Get current conversation details
  const currentConversation = conversations.find(c => String(c.id) === String(conversationId));

  // Get conversation name (full name for direct messages)
  const getConversationName = () => {
    if (!currentConversation) return 'Chat';
    
    if (currentConversation.group) {
      return currentConversation.name || 'Group Chat';
    }
    
    const otherParticipant = currentConversation.participants?.find(
      p => String(p.user.id) !== String(currentUser?.id)
    );
    
    if (otherParticipant) {
      return `${otherParticipant.user.firstname} ${otherParticipant.user.lastName}`;
    }
    
    return 'Direct Message';
  };

  // Check if user is online (last seen within 5 minutes)
  const isUserOnline = () => {
    if (!currentConversation || currentConversation.group) return false;
    
    const otherParticipant = currentConversation.participants?.find(
      p => String(p.user.id) !== String(currentUser?.id)
    );
    
    if (!otherParticipant?.user?.lastSeen) return false;
    
    const lastSeen = new Date(otherParticipant.user.lastSeen);
    const now = new Date();
    return (now - lastSeen) < (5 * 60 * 1000); // 5 minutes
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && sendMessage) {
      sendMessage(conversationId, newMessage);
      setNewMessage('');
      stopTyping(conversationId);
    }
  };

  const handleFocus = () => startTyping(conversationId);
  const handleBlur = () => stopTyping(conversationId);
  const handleInputChange = (e) => setNewMessage(e.target.value);
  const handleClearMessages = () => {
    dispatch(clearMessages(conversationId));
    setShowClearConfirm(false);
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => stopTyping(conversationId);
  }, [conversationId, stopTyping]);

  return (
    <div className={`flex flex-col h-[calc(100vh-60px)] ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header - Updated to match ListUsers style */}
      <div className={`sticky top-[60px] z-10 bg-${darkMode ? 'gray-900' : 'white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-3 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/conversations')}
            className="md:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              {currentConversation?.group ? (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                  {getConversationName()[0]}
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                    {getConversationName()[0]}
                  </div>
                  <span 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      isUserOnline() ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </>
              )}
            </div>
            <div>
              <h2 className={`text-base font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {getConversationName()}
              </h2>
              <p className={`text-xs flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentConversation?.group ? (
                  <span>Group • {currentConversation.participants?.length || 0} members</span>
                ) : (
                  <>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                      isUserOnline() ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {isUserOnline() ? 'Online' : 'Offline'}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-red-600 dark:text-red-400 text-sm hover:bg-red-100 dark:hover:bg-red-900/30"
          aria-label="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </motion.button>
      </div>

      {/* Messages */}
      <div
        ref={messageContainerRef}
        className={`flex-1 p-3 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
      >
        <AnimatePresence>
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onMarkAsRead={markMessageAsRead}
                theme={theme}
                darkMode={darkMode}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm"
            >
              <p>No messages yet. Start the conversation!</p>
            </motion.div>
          )}
        </AnimatePresence>
        {typingUsers.length > 0 && (
          <div className={`flex items-center gap-2 p-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{typingUsers[0]?.firstname || 'Someone'} is typing</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className={`sticky bottom-0 bg-${darkMode ? 'gray-900' : 'white'} p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center`}
      >
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Type a message..."
          className={`flex-1 p-2 rounded-full border ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-${themeConfig.primary.replace('#', '')} text-sm`}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className={`ml-2 p-2 rounded-full bg-${themeConfig.primary.replace('#', '')} text-white disabled:opacity-50`}
          disabled={!newMessage.trim()}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className="text-center">
                <div className="inline-flex p-2 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Delete Conversation?
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This will permanently delete all messages.
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClearConfirm(false)}
                    className={`flex-1 py-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearMessages}
                    className="flex-1 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${themeConfig.primary}40;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${themeConfig.primary}60;
        }
      `}</style>
    </div>
  );
};

export default MessageList;