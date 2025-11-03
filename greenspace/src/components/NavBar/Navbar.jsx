import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import { logoutThunk, fetchUserDetailsThunk } from '../../features/authSlice';
import { useWebSocketContext } from '../../features/WebSocketProvider';
import { setTheme, setHeaderBackground, setMenuPosition, setDarkMode } from '../../features/themeSlice';
import NotificationList from '../Notification/NotificationList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

// Composant ChatWrapper intégré directement
const ChatWrapper = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    console.log('ChatWrapper mounted'); // Debug log
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMessages([
        { id: 1, user: 'Victor Exrixon', message: 'Salut ! Comment ça va ?', time: '2 min', avatar: '/images/user-11.png' },
        { id: 2, user: 'Surfiya Zakir', message: 'Parfait ! Et toi ?', time: '1 min', avatar: '/images/user-12.png' }
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = () => {
    console.log('Sending message:', newMessage); // Debug log
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'Moi',
        message: newMessage,
        time: 'maintenant',
        avatar: '/images/profile-4.png',
        isMe: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '350px',
        height: '100%',
        backgroundColor: 'white',
        boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header du chat */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white'
        }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>Messages</h4>
          <button 
            onClick={() => {
              console.log('Closing chat'); // Debug log
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.5rem',
              borderRadius: '50%'
            }}
          >
            ×
          </button>
        </div>

        {/* Contenu du chat */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {isLoading ? (
            // Loader wrapper simplifié
            <div style={{ padding: '1rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  background: '#f8f9fa',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                  <div style={{ height: '1rem', background: '#e0e0e0', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
                  <div style={{ height: '1rem', background: '#e0e0e0', borderRadius: '0.25rem', width: '60%' }}></div>
                </div>
              ))}
            </div>
          ) : (
            // Interface de chat
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  flexDirection: msg.isMe ? 'row-reverse' : 'row'
                }}>
                  <img 
                    src={msg.avatar} 
                    alt={msg.user} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, maxWidth: '70%' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem',
                      flexDirection: msg.isMe ? 'row-reverse' : 'row'
                    }}>
                      <span style={{ color: '#333', fontWeight: 600, fontSize: '0.75rem' }}>{msg.user}</span>
                      <span style={{ color: '#999', fontSize: '0.625rem' }}>{msg.time}</span>
                    </div>
                    <div style={{
                      background: msg.isMe ? '#007bff' : '#f8f9fa',
                      color: msg.isMe ? 'white' : '#333',
                      padding: '0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      lineHeight: 1.4
                    }}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input pour nouveau message */}
        {!isLoading && (
          <div style={{ padding: '1rem', borderTop: '1px solid #eee', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '1.5rem',
                  outline: 'none',
                  fontSize: '0.875rem'
                }}
              />
              <button 
                onClick={handleSendMessage}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1.5rem',
                  cursor: 'pointer',
                  marginLeft: '0.5rem'
                }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isLoggingOut } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { theme, headerBackground, menuPosition, darkMode } = useSelector((state) => state.theme);
  const { connected, markAllNotificationsAsRead } = useWebSocketContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Load CSS files
  useEffect(() => {
    const cssFiles = [
      'src/assets/css/themify-icons.css',
      'src/assets/css/feather.css',
      'src/assets/css/style.css',
      'src/assets/css/emoji.css',
      'src/assets/css/lightbox.css'
    ];

    cssFiles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });

    // Ajouter les styles pour l'animation pulse
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup CSS files when component unmounts
      cssFiles.forEach(href => {
        const link = document.querySelector(`link[href="${href}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  // Apply theme and settings when they change
  useEffect(() => {
    // Apply theme
    document.body.className = `color-theme-${theme} mont-font`;
    
    // Apply header background
    const navHeader = document.querySelector('.nav-header');
    if (navHeader) {
      if (headerBackground) {
        navHeader.classList.add('bg-primary');
        navHeader.classList.remove('bg-white');
      } else {
        navHeader.classList.add('bg-white');
        navHeader.classList.remove('bg-primary');
      }
    }

    // Apply menu position
    const body = document.body;
    if (menuPosition) {
      body.classList.add('menu-right');
    } else {
      body.classList.remove('menu-right');
    }

    // Apply dark mode
    if (darkMode) {
      body.classList.add('theme-dark');
    } else {
      body.classList.remove('theme-dark');
    }
  }, [theme, headerBackground, menuPosition, darkMode]);

  // Load jQuery and JavaScript files
  useEffect(() => {
    // Ensure jQuery is loaded first
    const jqueryScript = document.createElement('script');
    jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    jqueryScript.async = true;
    document.body.appendChild(jqueryScript);

    // Load other scripts after jQuery
    const scripts = [
      'src/assets/js/plugin.js',
      'src/assets/js/lightbox.js',
      'src/assets/js/scripts.js',
    ];

    jqueryScript.onload = () => {
      scripts.forEach((src, index) => {
        setTimeout(() => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.body.appendChild(script);
        }, index * 100); // Small delay between scripts
      });
    };

    return () => {
      // Cleanup scripts when component unmounts
      const jqueryScriptElement = document.querySelector('script[src="https://code.jquery.com/jquery-3.6.0.min.js"]');
      if (jqueryScriptElement) {
        document.body.removeChild(jqueryScriptElement);
      }
      
      scripts.forEach(src => {
        const script = document.querySelector(`script[src="${src}"]`);
        if (script) {
          document.body.removeChild(script);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (user && !user.email) {
      dispatch(fetchUserDetailsThunk());
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
  };

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const handleHeaderBackgroundToggle = () => {
    dispatch(setHeaderBackground(!headerBackground));
  };

  const handleMenuPositionToggle = () => {
    dispatch(setMenuPosition(!menuPosition));
  };

  const handleDarkModeToggle = () => {
    dispatch(setDarkMode(!darkMode));
  };

  // Fonction pour gérer l'ouverture/fermeture du chat avec debug
  const toggleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle chat clicked, current state:', chatOpen);
    setChatOpen((prev) => {
      const newState = !prev;
      console.log('Setting chat state to:', newState);
      return newState;
    });
  };

  const closeChat = () => {
    console.log('Closing chat');
    setChatOpen(false);
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <>
      <div className="nav-header bg-white shadow-xs border-0">
        <div className="nav-top">
          <Link to="/home">
            <i className="feather-zap text-success display1-size me-2 ms-0"></i>
            <span className="d-inline-block fredoka-font ls-3 fw-600 text-current font-xxl logo-text mb-0">
              GreenSpace
            </span>
          </Link>
          
          {/* Mobile menu buttons */}
          <button 
            onClick={toggleChat} 
            className="mob-menu ms-auto me-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <i className="feather-message-circle text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </button>
          <Link to="/video" className="mob-menu me-2">
            <i className="feather-video text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </Link>
          <a href="#" className="me-2 menu-search-icon mob-menu" onClick={toggleSearch}>
            <i className="feather-search text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </a>
          <button className="nav-menu me-0 ms-2"></button>
        </div>
        
        {/* Search Form */}
        <form action="#" className={`float-left header-search ${searchOpen ? 'd-block' : ''}`}>
          <div className="form-group mb-0 icon-input">
            <i className="feather-search font-sm text-grey-400"></i>
            <input
              type="text"
              placeholder="Start typing to search.."
              className="bg-grey border-0 lh-32 pt-2 pb-2 ps-5 pe-3 font-xssss fw-500 rounded-xl w350 theme-dark-bg"
            />
          </div>
        </form>

        {/* Center Menu Icons */}
        <Link to="/home" className="p-2 text-center ms-3 menu-icon center-menu-icon">
          <i className="feather-home font-lg alert-primary btn-round-lg theme-dark-bg text-current"></i>
        </Link>
        <Link to="/stories" className="p-2 text-center ms-0 menu-icon center-menu-icon">
          <i className="feather-zap font-lg bg-greylight btn-round-lg theme-dark-bg text-grey-500"></i>
        </Link>
        <Link to="/video" className="p-2 text-center ms-0 menu-icon center-menu-icon">
          <i className="feather-video font-lg bg-greylight btn-round-lg theme-dark-bg text-grey-500"></i>
        </Link>
        <Link to="/groups" className="p-2 text-center ms-0 menu-icon center-menu-icon">
          <i className="feather-user font-lg bg-greylight btn-round-lg theme-dark-bg text-grey-500"></i>
        </Link>
        <Link to="/demande" className="p-2 text-center ms-0 menu-icon center-menu-icon">
          <i className="feather-shopping-bag font-lg bg-greylight btn-round-lg theme-dark-bg text-grey-500"></i>
        </Link>

        {/* Notifications Dropdown */}
        <a href="#" className="p-2 text-center ms-auto menu-icon" id="dropdownMenu3" data-bs-toggle="dropdown" aria-expanded="false">
          {unreadCount > 0 && <span className="dot-count bg-warning"></span>}
          <i className="feather-bell font-xl text-current"></i>
        </a>
        <div className="dropdown-menu dropdown-menu-end p-4 rounded-3 border-0 shadow-lg" aria-labelledby="dropdownMenu3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-700 font-xss mb-0">Notification ({unreadCount} unread)</h4>
            {unreadCount > 0 && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={markAllNotificationsAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          <NotificationList />
        </div>

        {/* Messages - Bouton avec debug amélioré */}
        <button 
          onClick={toggleChat} 
          className="p-2 text-center ms-3 menu-icon"
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            color: chatOpen ? '#007bff' : 'inherit'
          }}
          title="Ouvrir le chat"
        >
          <i className="feather-message-square font-xl text-current"></i>
        </button>

        {/* Settings Dropdown - Updated with Redux integration */}
        <div className="p-2 text-center ms-3 position-relative dropdown-menu-icon menu-icon cursor-pointer">
          <i className="feather-settings animation-spin d-inline-block font-xl text-current"></i>
          <div className="dropdown-menu-settings switchcolor-wrap">
            <h4 className="fw-700 font-sm mb-4">Settings</h4>
            <h6 className="font-xssss text-grey-500 fw-700 mb-3 d-block">Choose Color Theme</h6>
            <ul>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="red" 
                    checked={theme === 'red'}
                    onChange={() => handleThemeChange('red')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-red" style={{ backgroundColor: '#ff3b30' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="green"
                    checked={theme === 'green'}
                    onChange={() => handleThemeChange('green')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-green" style={{ backgroundColor: '#4cd964' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="blue" 
                    checked={theme === 'blue'}
                    onChange={() => handleThemeChange('blue')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-blue" style={{ backgroundColor: '#132977' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="pink"
                    checked={theme === 'pink'}
                    onChange={() => handleThemeChange('pink')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-pink" style={{ backgroundColor: '#ff2d55' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="yellow"
                    checked={theme === 'yellow'}
                    onChange={() => handleThemeChange('yellow')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-yellow" style={{ backgroundColor: '#ffcc00' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="orange"
                    checked={theme === 'orange'}
                    onChange={() => handleThemeChange('orange')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-orange" style={{ backgroundColor: '#ff9500' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="gray"
                    checked={theme === 'gray'}
                    onChange={() => handleThemeChange('gray')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-gray" style={{ backgroundColor: '#8e8e93' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="brown"
                    checked={theme === 'brown'}
                    onChange={() => handleThemeChange('brown')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-brown" style={{ backgroundColor: '#D2691E' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="darkgreen"
                    checked={theme === 'darkgreen'}
                    onChange={() => handleThemeChange('darkgreen')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-darkgreen" style={{ backgroundColor: '#228B22' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="deeppink"
                    checked={theme === 'deeppink'}
                    onChange={() => handleThemeChange('deeppink')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-deeppink" style={{ backgroundColor: '#FFC0CB' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="cadetblue"
                    checked={theme === 'cadetblue'}
                    onChange={() => handleThemeChange('cadetblue')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-cadetblue" style={{ backgroundColor: '#5f9ea0' }}></span>
                </label>
              </li>
              <li>
                <label className="item-radio item-content">
                  <input 
                    type="radio" 
                    name="color-radio" 
                    value="darkorchid"
                    checked={theme === 'darkorchid'}
                    onChange={() => handleThemeChange('darkorchid')}
                  />
                  <i className="ti-check"></i>
                  <span className="circle-color bg-darkorchid" style={{ backgroundColor: '#9932cc' }}></span>
                </label>
              </li>
            </ul>
            
            <div className="card bg-transparent-card border-0 d-block mt-3">
              <h4 className="d-inline font-xssss mont-font fw-700">Header Background</h4>
              <div className="d-inline float-right mt-1">
                <label className="toggle toggle-menu-color">
                  <input 
                    type="checkbox" 
                    checked={headerBackground}
                    onChange={handleHeaderBackgroundToggle}
                  />
                  <span className="toggle-icon"></span>
                </label>
              </div>
            </div>
            <div className="card bg-transparent-card border-0 d-block mt-3">
              <h4 className="d-inline font-xssss mont-font fw-700">Menu Position</h4>
              <div className="d-inline float-right mt-1">
                <label className="toggle toggle-menu">
                  <input 
                    type="checkbox" 
                    checked={menuPosition}
                    onChange={handleMenuPositionToggle}
                  />
                  <span className="toggle-icon"></span>
                </label>
              </div>
            </div>
            <div className="card bg-transparent-card border-0 d-block mt-3">
              <h4 className="d-inline font-xssss mont-font fw-700">Dark Mode</h4>
              <div className="d-inline float-right mt-1">
                <label className="toggle toggle-dark">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    onChange={handleDarkModeToggle}
                  />
                  <span className="toggle-icon"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        {user ? (
          <Dropdown>
            <Dropdown.Toggle as="div" className="p-0 ms-3 menu-icon">
              <img
                src={user.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : '/assets/images/profile-4.png'}
                alt="user"
                className="w40 mt--1"
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
              />
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu dropdown-menu-end p-4 rounded-3 border-0 shadow-lg">
              <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center">
                <i className="feather-user me-3"></i>
                Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/settings" className="d-flex align-items-center">
                <i className="feather-settings me-3"></i>
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center text-danger">
                <i className="feather-log-out me-3"></i>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Link to="/login" className="p-0 ms-3 menu-icon">
            <img src="/assets/images/profile-4.png" alt="user" className="w40 mt--1" />
          </Link>
        )}
      </div>

      {/* Chat Wrapper - Affiché conditionnellement avec debug */}
      {chatOpen && (
        <div>
          {console.log('Rendering ChatWrapper')}
          <ChatWrapper onClose={closeChat} />
        </div>
      )}
    </>
  );
};

export default Navbar;