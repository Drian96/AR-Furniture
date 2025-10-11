import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import furnitureLogo from '../../assets/AR-Furniture_Logo.png';
import shopName from '../../assets/Name.png';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'Products', href: '#products' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="bg-cream top-0 z-50 backdrop-blur-sm sticky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={furnitureLogo} 
              alt="Furniture Logo" 
              className="h-20 mt-2"
            />
            <img 
              src={shopName} 
              alt="Shop Name" 
              className="h-10 mt-2"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-lgreen transition-colors duration-200 font-medium text-m"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <Link 
              to="/login"
              className="hidden md:block border hover:bg-lgreen hover:text-dgreen transition-all duration-200 rounded-xl px-6 py-2 font-medium text-m"
            >
              Login
            </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-header-text" />
              ) : (
                <Menu className="h-6 w-6 text-header-text" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-header-border bg-header-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-header-text hover:text-header-text-hover transition-colors duration-200 font-medium text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="px-3 py-2">
                <Link 
                  to="/login" 
                  className="border border-header-text text-header-text hover:bg-header-text hover:text-header-background transition-all duration-200 rounded-full px-6 py-2 font-medium text-sm w-full block text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;