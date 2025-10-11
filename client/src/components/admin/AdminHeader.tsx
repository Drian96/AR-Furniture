import { Bell, User, ChevronDown, LogOut as LogOutIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext';
import furnitureLogo from '../../assets/AR-Furniture_Logo.png'
import shopName from '../../assets/Name.png'

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handleLogout = async () => {
    await logout();
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