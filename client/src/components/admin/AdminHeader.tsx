import { Bell, User, ChevronDown, LogOut as LogOutIcon, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification } from '../../services/supabase';
import furnitureLogo from '../../assets/AR-Furniture_Logo.png'
import shopName from '../../assets/NAME.png'

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  // Close the menu if a click occurs outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setShowNotifications(false);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  return (
    <>
    <header className="bg-cream sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">
            <Link to="/admin" className="text-2xl font-serif font-bold text-dgreen hover:text-lgreen transition-colors">
              <div className="flex items-center">
                <img src={furnitureLogo} alt="Furniture Logo" className="h-12 mt-2" />
                <img src={shopName} alt="Shop Name" className="h-10 mt-2" />
              </div>
            </Link>

          </div>

          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-dgreen hover:text-lgreen transition-colors">
              Admin
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <button
                className="relative text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen cursor-pointer"
                onClick={() => setShowNotifications((prev) => !prev)}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dgreen text-cream text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-dgreen font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-xs text-dgray">({unreadCount} unread)</span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-dgray text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors relative ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                            title="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex justify-between items-start pr-6">
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">{notification.title}</h5>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.created_at)}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}> {/* Add relative positioning and ref */}
              <div
                className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen flex items-center cursor-pointer"
                onClick={toggleUserMenu}
              >
                <User className="w-5 h-5" />
                {/* Optional: Add a dropdown arrow */}
                <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/AdminProfile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  {/* Settings visible only for admin */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/system-settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                  )}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
    {showLogoutConfirm && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOutIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-dgreen mb-2">Logout</h3>
            <p className="text-dgray">Are you sure you want to logout? You will be redirected to the landing page.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2 border border-lgreen text-dgray rounded-lg hover:border-dgreen cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;