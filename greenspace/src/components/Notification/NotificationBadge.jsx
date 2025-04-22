// src/components/Notifications/NotificationBadge.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const NotificationBadge = ({ onClick }) => {
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  return (
    <div className="notification-badge-container" onClick={onClick}>
      <i className="notification-icon">🔔</i>
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </div>
  );
};

export default NotificationBadge;