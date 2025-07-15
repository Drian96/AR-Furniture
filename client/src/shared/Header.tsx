
import { Search, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock auth state
  const [cartCount, setCartCount] = useState(0); // Mock cart count

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // TODO: Implement search functionality
  };

  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn); // Mock login toggle
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
            {isLoggedIn ? (
              
              <Link to= "/profile"
                onClick={handleLogin}
                className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen"
              >
                <User className="w-5 h-5" />
              </Link>
              
            ) : (
              <button
                onClick={handleLogin}
                className="text-dgreen hover:text-lgreen transition-colors font-medium"
              >
                Sign-Up | Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
