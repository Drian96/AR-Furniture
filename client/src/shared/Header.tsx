import { Search, ShoppingCart, User, LogOut, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import furnitureLogo from '../assets/AR-Furniture_Logo.png';
import shopName from '../assets/NAME.png'


const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { items, totalQuantity, totalPrice } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  
  // Refs for dropdowns
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  
  let hoverTimeout: any;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      // Navigate to products page without search query
      window.location.href = '/products';
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('✅ Logged out successfully');
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  // Mock notification data
  const notifications = [
    {
      id: 1,
      title: "Order Confirmed",
      message: "Your order #12345 has been confirmed",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "New Product Alert",
      message: "Check out our new furniture collection",
      time: "1 day ago",
      read: false
    },
    {
      id: 3,
      title: "Delivery Update",
      message: "Your order will arrive tomorrow",
      time: "2 days ago",
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside profile dropdown
      if (showProfileDropdown && profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
      
      // Check if click is outside notification dropdown
      if (showNotifications && notificationDropdownRef.current && !notificationDropdownRef.current.contains(target)) {
        setShowNotifications(false);
      }
      
      // Check if click is outside cart dropdown
      if (showCart && cartDropdownRef.current && !cartDropdownRef.current.contains(target)) {
        setShowCart(false);
      }
      
      // Close mobile search when clicking outside
      if (showMobileSearch) {
        setShowMobileSearch(false);
      }
    };

    // Only add listener if any dropdown is open
    if (showProfileDropdown || showNotifications || showCart || showMobileSearch) {
      // Use setTimeout to ensure this runs after the current click event
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showMobileSearch, showProfileDropdown, showNotifications, showCart]);

  return (
    <header className="bg-cream shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16">
          <Link to="/">
            <div className="flex items-center">
              <img src={furnitureLogo} alt="Furniture Logo" className="h-12 mt-2" />
              <img src={shopName} alt="Shop Name" className="h-10 mt-2 ml-2" />
            </div>
          </Link>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search furniture..."
                className="w-full pl-4 pr-12 py-2 border-2 border-lgreen rounded-lg focus:outline-none focus:border-dgreen transition-colors bg-white"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lgreen hover:text-dgreen transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-dgreen hover:text-lgreen transition-colors p-2"
                title="Notifications"
              >
                <Bell className="w-6 h-6 cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dgreen text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 mt-2">
                  <h4 className="text-dgreen font-semibold mb-3">Notifications</h4>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg ${!notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{notification.title}</h5>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <div className="relative" ref={cartDropdownRef}>
              <button 
                className="relative text-dgreen hover:text-lgreen transition-colors"
                onClick={() => setShowCart(!showCart)}
              >
                <ShoppingCart className="w-6 h-6 cursor-pointer" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-dgreen text-cream text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </button>
              
              {/* Cart Dropdown */}
              {showCart && (
                <div className="absolute right-0 top-full w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 mt-2">
                  <h4 className="text-dgreen font-semibold mb-3">My Cart</h4>
                  {items.length === 0 ? (
                    <p className="text-gray-600 text-sm">Your cart is empty.</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {items.map((it) => (
                        <div key={it.productId} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                            {it.imageUrl ? (
                              <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-dgreen font-medium truncate">{it.name}</div>
                            <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                          </div>
                          <div className="text-sm text-dgreen font-semibold">₱{(it.price * it.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-dgreen font-semibold">Total:</span>
                    <span className="text-dgreen font-bold">₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Link 
                    to="/cart" 
                    className="block mt-4 w-full text-center bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-lgreen cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCart(false);
                    }}
                  >
                    View Cart
                  </Link>
                </div>
              )}
            </div>
            
            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen cursor-pointer"
                  title={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Profile'}
                >
                  <User className="w-5 h-5" />
                </button>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 mt-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileDropdown(false);
                      }}
                    >
                      My Profile
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogoutClick();
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-dgreen hover:text-lgreen transition-colors font-medium px-4 py-2 border border-lgreen rounded-lg"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-16">
          {/* Left side - Logo and Search */}
          <div className="flex items-center space-x-3 flex-1">
            <Link to="/">
              <img src={furnitureLogo} alt="Furniture Logo" className="h-10" />
            </Link>
            
            {/* Mobile Search - Show only when search icon is clicked */}
            {showMobileSearch ? (
              <div className="flex-1 max-w-xs">
                <form onSubmit={(e) => {
                  handleSearch(e);
                  setShowMobileSearch(false);
                }} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-3 pr-10 py-2 border border-lgreen rounded-lg focus:outline-none focus:border-dgreen transition-colors bg-white text-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-lgreen"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowMobileSearch(true)}
                className="text-dgreen hover:text-lgreen transition-colors p-2"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Right side - Notifications, Cart, Profile */}
          <div className="flex items-center space-x-3">
            {/* Mobile Notifications */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-dgreen hover:text-lgreen transition-colors p-2"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dgreen text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Mobile Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 mt-2">
                  <h4 className="text-dgreen font-semibold mb-3 text-sm">Notifications</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-2 rounded-lg ${!notification.read ? 'bg-blue-50 border-l-2 border-blue-500' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="text-xs font-medium text-gray-900">{notification.title}</h5>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Cart */}
            <div className="relative" ref={cartDropdownRef}>
              <button 
                className="relative text-dgreen hover:text-lgreen transition-colors p-2"
                onClick={() => setShowCart(!showCart)}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dgreen text-cream text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </button>
              
              {/* Mobile Cart Dropdown */}
              {showCart && (
                <div className="absolute right-0 top-full w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 mt-2">
                  <h4 className="text-dgreen font-semibold mb-3 text-sm">My Cart</h4>
                  {items.length === 0 ? (
                    <p className="text-gray-600 text-sm">Your cart is empty.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-3">
                      {items.map((it) => (
                        <div key={it.productId} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                            {it.imageUrl ? (
                              <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-dgreen font-medium truncate">{it.name}</div>
                            <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                          </div>
                          <div className="text-xs text-dgreen font-semibold">₱{(it.price * it.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-dgreen font-semibold text-sm">Total:</span>
                    <span className="text-dgreen font-bold text-sm">₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Link to="/cart" className="block mt-3 w-full text-center bg-dgreen text-cream px-3 py-2 rounded-lg hover:bg-lgreen cursor-pointer text-sm">
                    View Cart
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen"
                  title={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Profile'}
                >
                  <User className="w-5 h-5" />
                </button>
                
                {/* Mobile Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 mt-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogoutClick();
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-dgreen hover:text-lgreen transition-colors font-medium px-3 py-2 border border-lgreen rounded-lg text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Logout</h3>
              <p className="text-dgray">
                Are you sure you want to logout? You will be redirected to the landing page.
              </p>
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
    </header>
  );
};

export default Header;

