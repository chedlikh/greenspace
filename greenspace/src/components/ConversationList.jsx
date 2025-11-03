import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchConversations } from '../features/conversationSlice';
import { useWebSocketContext } from '../features/WebSocketProvider';
import { formatDistanceToNow } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

const themeColors = {
  blue: { primary: '#0084FF', secondary: '#007BFF', gradient: 'from-[#0084FF] to-[#007BFF]' },
  green: { primary: '#00C853', secondary: '#00B248', gradient: 'from-[#00C853] to-[#00B248]' },
  purple: { primary: '#AB47BC', secondary: '#9C27B0', gradient: 'from-[#AB47BC] to-[#9C27B0]' },
};

const ConversationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, error } = useSelector((state) => state.conversations);
  const { theme, darkMode } = useSelector((state) => state.theme);
  const { user, token } = useSelector((state) => state.auth);
  const { createDirectConversation, addParticipant } = useWebSocketContext();
  const [otherUserId, setOtherUserId] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  useEffect(() => {
    if (token && user) {
      dispatch(fetchConversations());
    }
  }, [dispatch, token, user]);

  const getThemeConfig = () => themeColors[theme] || themeColors.blue;
  const themeConfig = getThemeConfig();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  const handleConversationClick = (conversationId) => {
    setSelectedConversationId(conversationId);
    navigate(`/conversations/${conversationId}`);
  };

  const getConversationName = (conversation) => {
    if (conversation.group) {
      return conversation.name || 'Group Chat';
    }
    const otherParticipant = conversation.participants?.find(p => p.user.id !== user?.id);
    return otherParticipant ? `${otherParticipant.user.firstname} ${otherParticipant.user.lastName}` : 'Direct Message';
  };

  const getConversationPhoto = (conversation) => {
    if (conversation.group && conversation.groupImage) return conversation.groupImage;
    const otherParticipant = conversation.participants?.find(p => p.user.id !== user?.id);
    return otherParticipant?.user.photoProfile || null;
  };

  const isUserOnline = (user) => {
    if (!user?.lastSeen) return false;
    const lastSeen = new Date(user.lastSeen);
    return (new Date() - lastSeen) < (5 * 60 * 1000);
  };

  const getConversationStatus = (conversation) => {
    if (conversation.group) return { text: 'Group', online: false };
    const otherParticipant = conversation.participants?.find(p => p.user.id !== user?.id);
    const online = isUserOnline(otherParticipant?.user);
    return { text: online ? 'Online' : 'Offline', online };
  };

  return (
    <div className={`w-full p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'} h-[calc(100vh-60px)] flex flex-col`}>
      <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Chats
      </h2>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const status = getConversationStatus(conv);
            const isSelected = selectedConversationId === conv.id;
            const lastMessage = conv.lastMessage?.content || 'No messages yet';

            return (
              <motion.div
                key={conv.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleConversationClick(conv.id)}
                className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`
                    : `hover:${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`
                }`}
              >
                <div className="relative mr-3">
                  <img
                    src={getConversationPhoto(conv) 
                      ? `${API_BASE_URL}/images/${getConversationPhoto(conv)}` 
                      : "/images/default-user.png"}
                    alt="Profile"
                    className="rounded-circle border shadow"
                    width="48"
                    height="48"
                  />
                  {!conv.group && status.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getConversationName(conv)}
                    </h4>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">
                      {formatDate(conv.lastMessage?.sentDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lastMessage}
                    </p>
                    {conv.unreadMessagesCount > 0 && (
                      <span className={`ml-2 min-w-[18px] h-[18px] px-1.5 text-[11px] font-semibold flex items-center justify-center text-white bg-${themeConfig.primary.replace('#', '')} rounded-full`}>
                        {conv.unreadMessagesCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No chats yet.</p>
        )}
      </div>

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

export default ConversationList;