import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import { logout, fetchUserDetailsThunk } from '../../features/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && !user.email) {
      dispatch(fetchUserDetailsThunk());
    }
  }, [user, dispatch]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="modern-navbar">
      <div className="navbar-container">
        {/* Main Navigation Items */}
        <div className="nav-links">
          <Link to="/home" className="nav-item">
            <i className="feather-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/explore" className="nav-item">
            <i className="feather-compass"></i>
            <span>Explore</span>
          </Link>
          <Link to="/notifications" className="nav-item">
            <i className="feather-bell"></i>
            <span>Notifications</span>
          </Link>
          <Link to="/messages" className="nav-item">
            <i className="feather-message-circle"></i>
            <span>Messages</span>
          </Link>
        </div>

        {/* Search Bar */}
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

        {/* User Section */}
        <div className="user-section">
          {user ? (
            <>
              {/* Create Post Button */}
              <button className="create-post-btn">
                <i className="feather-plus-circle"></i>
                <span>Create</span>
              </button>
            
              {/* Settings Dropdown */}
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
              
              {/* User Profile Dropdown */}
              <Dropdown>
                <Dropdown.Toggle as="div" id="dropdown-profile" className="profile-toggle">
                  <img
                    src={user.photoProfile ? `http://192.168.0.187:8089/images/${user.photoProfile}` : "images/default-user.png"}
                    alt="Profile"
                    className="profile-image"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu className="profile-dropdown">
                  <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">Account Settings</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/help">Help Center</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => dispatch(logout())}>Logout</Dropdown.Item>
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
