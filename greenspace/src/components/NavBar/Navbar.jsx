// src/components/NavBar/Navbar.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import { logoutThunk, fetchUserDetailsThunk } from '../../features/authSlice';
import { useNotificationSubscription, useNotificationActions } from '../../services/websocket';
import { format } from 'date-fns';
import NotificationList from '../Notification/NotificationList';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isLoggingOut } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  
  useNotificationSubscription();
  const { markAllAsRead } = useNotificationActions();
  
  useEffect(() => {
    if (user && !user.email) {
      dispatch(fetchUserDetailsThunk());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  const toggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="modern-navbar">
      <div className="navbar-container">
        <div className="nav-links">
          <Link to="/home" className="nav-item">
            <i className="feather-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/explore" className="nav-item">
            <i className="feather-compass"></i>
            <span>Explore</span>
          </Link>
          
          <div className="nav-item notification-nav-item" ref={notificationsRef}>
            <div className="notifications-toggle" onClick={toggleNotifications}>
              <i className="feather-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
              <span>Notifications</span>
            </div>
            {notificationsOpen && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications ({unreadCount} unread)</h3>
                  {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <NotificationList /> {/* Use NotificationList */}
              </div>
            )}
          </div>
          <Link to="/messages" className="nav-item">
            <i className="feather-message-circle"></i>
            <span>Messages</span>
          </Link>
        </div>
        {/* Rest of the navbar unchanged */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="feather-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input" 
            />
          </div>
        </div>
        <div className="user-section">
          {user ? (
            <>
              <button className="create-post-btn">
                <i className="feather-plus-circle"></i>
                <span>Create</span>
              </button>
              <Dropdown>
                <Dropdown.Toggle as="div" id="dropdown-settings" className="settings-toggle">
                  <i className="feather-settings"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="settings-dropdown">
                  <h4 className="dropdown-header">Settings</h4>
                  <Dropdown.Item>Appearance</Dropdown.Item>
                  <Dropdown.Item>Privacy</Dropdown.Item>
                  <Dropdown.Item>Notifications</Dropdown.Item>
                  <div className="theme-toggle">
                    <span>Dark Mode</span>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle as="div" id="dropdown-profile" className="profile-toggle">
                  <img

                    src={user.photoProfile ? `http://greenspace.ddns.net:8089/images/${user.photoProfile}` : "images/default-user.png"}
                    alt="Profile"
                    className="profile-image"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu className="profile-dropdown">
                  <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">Account Settings</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/help">Help Center</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Log In</Link>
              <Link to="/register" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;