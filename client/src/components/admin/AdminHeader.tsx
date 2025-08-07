import { Bell, User, ChevronDown } from 'lucide-react'; // Import ChevronDown for a potential indicator
import { useState, useRef, useEffect } from 'react'; // Import useState, useRef, useEffect
import { Link } from 'react-router-dom'

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close the menu if a click occurs outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="bg-cream shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">

            <Link to="/admin" className="text-2xl font-serif font-bold text-dgreen hover:text-lgreen transition-colors">
              AR-Furniture
            </Link>

          </div>

          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-dgreen hover:text-lgreen transition-colors">
              Admin
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-dgreen hover:text-lgreen transition-colors p-2 rounded-full border border-lgreen cursor-pointer">
              <Bell className="w-5 h-5" />
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
                  <a
                    href="/AdminProfile" // Replace with your actual routes
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  {/* Use Link for client-side routing to system settings */}
                  <Link
                    to="/admin/system-settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => console.log('Logging out...')} // Replace with your logout logic
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
  );
};

export default Header;