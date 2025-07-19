
import { Search, ShoppingCart, User, LogOut, LogOut as LogOutIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0); // Mock cart count
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // TODO: Implement search functionality
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
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

  return (
    <header className="bg-cream shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold text-dgreen hover:text-lgreen transition-colors">
              AR-Furniture
            </Link>
          </div>
          
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
            {/* Cart Icon */}
            <button className="relative text-dgreen hover:text-lgreen transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-dgreen text-cream text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/profile"
                  className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen"
                  title={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Profile'}
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenLoginModal}
                className="text-dgreen hover:text-lgreen transition-colors font-medium"
              >
                Sign-Up | Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOutIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Logout</h3>
              <p className="text-dgray">
                Are you sure you want to logout? You will be redirected to the landing page.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
