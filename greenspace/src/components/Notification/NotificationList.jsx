import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../../features/WebSocketProvider';
import { clearNotifications } from '../../features/notificationSlice';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Trash2, X, Eye, Clock, ChevronRight } from 'lucide-react';

// Theme color mapping with dark mode support
const themeColors = {
  red: {
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#fef2f2',
    accentDark: '#450a0a',
    gradient: 'from-red-500 to-red-600',
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#f0fdf4',
    accentDark: '#052e16',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#eff6ff',
    accentDark: '#1e3a8a',
    gradient: 'from-blue-500 to-blue-600',
  },
  pink: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#fdf2f8',
    accentDark: '#831843',
    gradient: 'from-pink-500 to-pink-600',
  },
  yellow: {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fffbeb',
    accentDark: '#451a03',
    gradient: 'from-amber-500 to-amber-600',
  },
  orange: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fff7ed',
    accentDark: '#431407',
    gradient: 'from-orange-500 to-orange-600',
  },
  gray: {
    primary: '#6b7280',
    secondary: '#4b5563',
    accent: '#f9fafb',
    accentDark: '#374151',
    gradient: 'from-gray-500 to-gray-600',
  },
  brown: {
    primary: '#a16207',
    secondary: '#92400e',
    accent: '#fefce8',
    accentDark: '#451a03',
    gradient: 'from-yellow-600 to-yellow-700',
  },
  darkgreen: {
    primary: '#16a34a',
    secondary: '#15803d',
    accent: '#f0fdf4',
    accentDark: '#14532d',
    gradient: 'from-green-600 to-green-700',
  },
  deeppink: {
    primary: '#ec4899',
    secondary: '#be185d',
    accent: '#fdf2f8',
    accentDark: '#831843',
    gradient: 'from-pink-500 to-rose-600',
  },
  cadetblue: {
    primary: '#0891b2',
    secondary: '#0e7490',
    accent: '#f0f9ff',
    accentDark: '#164e63',
    gradient: 'from-cyan-600 to-cyan-700',
  },
  darkorchid: {
    primary: '#9333ea',
    secondary: '#7c3aed',
    accent: '#faf5ff',
    accentDark: '#581c87',
    gradient: 'from-purple-600 to-purple-700',
  },
};

const NotificationItem = React.forwardRef(({ notification, onMarkAsRead, theme, darkMode }, ref) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  
  // Safely get theme config with fallback
  const getThemeConfig = () => {
    try {
      return themeColors[theme] || themeColors.blue;
    } catch (error) {
      console.error('Error getting theme config:', error);
      return themeColors.blue;
    }
  };

  const [themeConfig, setThemeConfig] = useState(getThemeConfig());

  useEffect(() => {
    setThemeConfig(getThemeConfig());
  }, [theme]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (!notification) {
    return null;
  }

  const notificationType = notification.type
    ? notification.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Notification';

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Mark as read first
    if (!notification.read && typeof onMarkAsRead === 'function') {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to sondage
    if (notification.sondageId) {
      console.log('Navigating to sondage:', notification.sondageId);
      navigate(`/sondage/${notification.sondageId}`);
    }
  };

  const handleMarkAsRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onMarkAsRead === 'function') {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        notification.read
          ? `bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700`
          : `bg-white dark:bg-gray-800 border-2 shadow-lg hover:shadow-xl`
      } ${notification.sondageId ? 'cursor-pointer' : ''}`}
      style={{ 
        borderColor: !notification.read ? themeConfig?.primary : undefined,
        boxShadow: !notification.read ? `0 0 0 1px ${themeConfig?.primary || '#3b82f6'}20` : undefined
      }}
      whileHover={{ 
        scale: notification.sondageId ? 1.02 : 1,
        y: -2
      }}
      whileTap={{ scale: notification.sondageId ? 0.98 : 1 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={notification.sondageId ? 'button' : 'article'}
      tabIndex={0}
      aria-label={notification.sondageId ? `View sondage: ${notification.message}` : notification.message}
    >
      {!notification.read && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeConfig?.gradient || 'from-blue-500 to-blue-600'}`} />
      )}
      
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${themeConfig?.primary || '#3b82f6'}10, ${themeConfig?.secondary || '#2563eb'}05)`
        }}
      />

      <div className="relative p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`p-1.5 rounded-lg ${!notification.read ? 'bg-gradient-to-br ' + (themeConfig?.gradient || 'from-blue-500 to-blue-600') : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Bell className={`w-4 h-4 ${!notification.read ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {notificationType}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(notification.createdAt)}</span>
                </div>
              </div>
              {!notification.read && (
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${themeConfig?.gradient || 'from-blue-500 to-blue-600'}`} />
              )}
            </div>

            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'} ${!notification.read ? 'font-medium' : ''}`}>
              {notification.message || 'No message available'}
            </p>

            {notification.sondageId && (
              <div className="flex items-center space-x-1 mt-3 text-xs font-medium"
                   style={{ color: themeConfig?.primary || '#3b82f6' }}>
                <span>View Sondage</span>
                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-3 h-3" />
                </motion.div>
              </div>
            )}
          </div>

          {!notification.read && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMarkAsRead}
              className={`ml-3 p-2 rounded-lg bg-gradient-to-br ${themeConfig?.gradient || 'from-blue-500 to-blue-600'} text-white opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg`}
              aria-label={`Mark ${notificationType} as read`}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

NotificationItem.displayName = 'NotificationItem';

const NotificationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { theme, darkMode } = useSelector((state) => state.theme);
  const wsContext = useWebSocketContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Safely get theme config with fallback
  const getThemeConfig = () => {
    try {
      return themeColors[theme] || themeColors.blue;
    } catch (error) {
      console.error('Error getting theme config:', error);
      return themeColors.blue;
    }
  };

  const [themeConfig, setThemeConfig] = useState(getThemeConfig());

  useEffect(() => {
    setThemeConfig(getThemeConfig());
  }, [theme]);

  const markNotificationAsRead = wsContext?.markNotificationAsRead;
  const markAllNotificationsAsRead = wsContext?.markAllNotificationsAsRead;

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    dispatch(clearNotifications());
    setShowClearConfirm(false);
  };

  const cancelClearAll = () => {
    setShowClearConfirm(false);
  };

  const handleMarkAllAsRead = () => {
    if (typeof markAllNotificationsAsRead === 'function') {
      markAllNotificationsAsRead();
    } else {
      dispatch({ type: 'notifications/markAllAsRead' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`sticky top-0 z-10 backdrop-blur-lg rounded-t-2xl p-6 border-b ${
        darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${themeConfig?.gradient || 'from-blue-500 to-blue-600'}`}>
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Notifications
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r ${themeConfig?.gradient || 'from-blue-500 to-blue-600'} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
                aria-label="Mark all notifications as read"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Mark all read</span>
              </motion.button>
            )}
            {notifications?.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAll}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Clear all</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-b-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markNotificationAsRead}
                  theme={theme}
                  darkMode={darkMode}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${themeConfig?.gradient || 'from-blue-500 to-blue-600'} mb-4`}>
                  <Bell className="w-8 h-8 text-white opacity-60" />
                </div>
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-sm">You're all caught up! New notifications will appear here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Clear All Notifications?
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This will permanently delete all notifications. This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelClearAll}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmClearAll}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                  >
                    Clear All
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${themeConfig?.primary || '#3b82f6'}40;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${themeConfig?.primary || '#3b82f6'}60;
        }
      `}</style>
    </div>
  );
};

export default NotificationList;