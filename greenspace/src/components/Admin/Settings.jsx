import React from "react";
import { useSelector } from "react-redux";
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
  ChevronRight
} from "react-feather";

const Settings = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {/* General Settings Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              General
            </h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/myinfo" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-3">
                      <Home size={18} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Account Information</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mr-3">
                      <MapPin size={18} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Admin Dashboard</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </Link>
              </li>
              <li>
                <Link 
                  to="/social-account" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 mr-3">
                      <Twitter size={18} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Social Account</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Settings Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Account
            </h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/payment" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mr-3">
                      <CreditCard size={18} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Payment Methods</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </Link>
              </li>
              <li>
                <Link 
                  to="/password" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-3">
                      <Inbox size={18} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Password & Security</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Other Settings Section */}
          <div className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Other
            </h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/notifications" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mr-3">
                      <Bell size={18} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Notifications</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 mr-3">
                      <HelpCircle size={18} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Help & Support</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </Link>
              </li>
              <li>
                <Link 
                  to="/logout" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 mr-3">
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
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Logged in as {user.username}</p>
          <p className="mt-1">{user.email}</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Settings;