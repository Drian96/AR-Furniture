import { CircleUserRound } from 'lucide-react';
import { Link } from 'react-router-dom'; 

const Header = () => {



  return (
    <header className="bg-lgray shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Site Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-gray-900">
              AR-Furniture
            </h1>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-900 hover:text-dgreen">
              Home
            </a>
            <a href="#products" className="text-gray-900 hover:text-dgreen">
              Products
            </a>
            <a href="#about" className="text-gray-900 hover:text-dgreen">
              About
            </a>
            <a href="#contact" className="text-gray-900 hover:text-dgreen">
              Contact
            </a>
          </nav>

          {/* User Icon (to navigate to login page) */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-primary hover:text-dgreen cursor-pointer p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-dgreen"
              aria-label="Go to login page"
            >
              <CircleUserRound className="w-7.5 h-7.5" />
            </Link>
          </div>
        </div>
      </div>


    </header>
  );
};

export default Header;
