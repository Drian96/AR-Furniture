import { Search, ShoppingCart, User, LogOut, LogOut as LogOutIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import furnitureLogo from '../assets/AR-Furniture_Logo.png';


const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { items, totalQuantity, totalPrice } = useCart();
  const [showCart, setShowCart] = useState(false);
  let hoverTimeout: any;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // TODO: Implement search functionality
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
            <Link to="/" >
              <img src={furnitureLogo} alt="Furniture Logo" className="h-15 w-auto mt-2" />
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
          
          <div className="flex items-center space-x-4 relative">
            {/* Cart Icon */}
            <div 
              className="relative text-dgreen hover:text-lgreen transition-colors"
              onMouseEnter={() => {
                if (hoverTimeout) clearTimeout(hoverTimeout);
                setShowCart(true);
              }}
              onMouseLeave={() => {
                hoverTimeout = setTimeout(() => setShowCart(false), 100);
              }}
            >
              <button className="relative" onClick={() => setShowCart((s) => !s)} aria-haspopup="dialog" aria-expanded={showCart}>
                <ShoppingCart className="w-6 h-6 cursor-pointer" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-dgreen text-cream text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </button>
              
              {/* Cart Dropdown */}
              {showCart && (
                <div className="absolute right-0 top-full w-80 bg-white rounded-lg shadow-lg border border-sage-light p-4 z-50 mt-2">
                  <h4 className="text-dgreen font-semibold mb-3">My Cart</h4>
                  {items.length === 0 ? (
                    <p className="text-dgray text-sm">Your cart is empty.</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {items.map((it) => (
                        <div key={it.productId} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-sage-light rounded overflow-hidden">
                            {it.imageUrl ? (
                              <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-dgreen font-medium truncate">{it.name}</div>
                            <div className="text-xs text-dgray">Qty: {it.quantity}</div>
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
                  <Link to="/cart" className="block mt-4 w-full text-center bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-lgreen cursor-pointer">
                    View my shopping cart
                  </Link>
                </div>
              )}
            </div>
            
            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/profile"
                  className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen"
                  title={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Profile'}
                >
                  <User className="w-5 h-5 cursor-pointer" />
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-dgreen hover:text-lgreen transition-colors font-medium"
              >
                Sign-Up | Login
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
