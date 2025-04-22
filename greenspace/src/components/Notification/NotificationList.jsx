// src/components/Notifications/NotificationList.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNotificationActions } from '../../services/websocket';
import { clearNotifications } from '../../features/notificationSlice';
import { format } from 'date-fns';
import './notifications.css';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (!notification) {
    return null;
  }

  const notificationType = notification.type ? notification.type.replace(/_/g, ' ') : 'Notification';

  return (
    <div className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
      <div className="notification-content">
        <h4>{notificationType}</h4>
        <p>{notification.message || 'No message available'}</p>
        <span className="notification-time">{formatDate(notification.createdAt)}</span>
      </div>
      {!notification.read && (
        <button 
          className="mark-read-btn"
          onClick={() => onMarkAsRead(notification.id)}
        >
          Mark as read
        </button>
      )}
    </div>
  );
};

const NotificationList = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { markAsRead, markAllAsRead } = useNotificationActions();

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  return (
    <div className="notifications-list">
      {notifications && notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
          />
        ))
      ) : (
        <div className="no-notifications">No notifications</div>
      )}
      {unreadCount > 0 && (
        <button className="mark-all-read-btn" onClick={markAllAsRead}>
          Mark all as read
        </button>
      )}
      <button className="mark-all-read-btn" onClick={handleClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default NotificationList;