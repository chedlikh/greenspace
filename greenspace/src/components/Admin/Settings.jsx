import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { 
  Home, 
  MapPin, 
  Twitter, 
  CreditCard, 
  Inbox, 
  Bell, 
  HelpCircle, 
  Lock,
  ChevronRight,
  Moon,
  Sun
} from "react-feather";

// Theme color mapping based on Navbar's theme settings
const themeColors = {
  red: { primary: '#ff3b30', secondary: '#ff2d55' },
  green: { primary: '#4cd964', secondary: '#34c759' },
  blue: { primary: '#132977', secondary: '#007aff' },
  pink: { primary: '#ff2d55', secondary: '#ff69b4' },
  yellow: { primary: '#ffcc00', secondary: '#ff9500' },
  orange: { primary: '#ff9500', secondary: '#ff7f50' },
  gray: { primary: '#8e8e93', secondary: '#a9a9a9' },
  brown: { primary: '#D2691E', secondary: '#8B4513' },
  darkgreen: { primary: '#228B22', secondary: '#006400' },
  deeppink: { primary: '#FFC0CB', secondary: '#FF69B4' },
  cadetblue: { primary: '#5f9ea0', secondary: '#4682b4' },
  darkorchid: { primary: '#9932cc', secondary: '#9400d3' },
};

const Settings = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const { theme, darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    dispatch({ type: "theme/setDarkMode", payload: !darkMode });
  };

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--theme-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your account preferences and settings
            </p>
          </div>

          {/* Settings Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>
            {/* General Settings Section */}
            <div className={`p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                General
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/myinfo" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-[color:var(--theme-primary)]/20' : 'bg-[color:var(--theme-primary)]/10'} text-[color:var(--theme-primary)] mr-3`}>
                        <Home size={18} />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-[color:var(--theme-secondary)]/20' : 'bg-[color:var(--theme-secondary)]/10'} text-[color:var(--theme-secondary)] mr-3`}>
                        <MapPin size={18} />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/social-account" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} text-red-600 dark:text-red-400 mr-3`}>
                        <Twitter size={18} />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Social Account</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account Settings Section */}
            <div className={`p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                Account
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/payment" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'} text-purple-600 dark:text-purple-400 mr-3`}>
                        <CreditCard size={18} />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Methods</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/password" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-[color:var(--theme-primary)]/20' : 'bg-[color:var(--theme-primary)]/10'} text-[color:var(--theme-primary)] mr-3`}>
                        <Inbox size={18} />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Password & Security</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Other Settings Section */}
            <div className="p-6">
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                Other
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/notifications" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-amber-900/50' : 'bg-amber-100'} text-amber-600 dark:text-amber-400 mr-3`}>
                        <Bell size={18} />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/help" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/50' : 'bg-green-100'} text-green-600 dark:text-green-400 mr-3`}>
                        <HelpCircle size={18} />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Help & Support</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
                <li>
                  <div className="flex items-center justify-between p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-gray-600 dark:text-gray-400 mr-3`}>
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={handleDarkModeToggle}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 ${darkMode ? 'bg-[color:var(--theme-primary)]' : 'bg-gray-200'} peer-checked:bg-[color:var(--theme-primary)] rounded-full peer transition-colors`}></div>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-5' : ''}`}></div>
                    </label>
                  </div>
                </li>
                <li>
                  <Link 
                    to="/logout" 
                    className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors text-red-600 dark:text-red-400`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} text-red-600 dark:text-red-400 mr-3`}>
                        <Lock size={18} />
                      </div>
                      <span className="font-medium">Logout</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* User Info Footer */}
          <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Logged in as {user.username}</p>
            <p className="mt-1">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;