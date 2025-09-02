import { CircleUserRound } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import furnitureLogo from '../../assets/AR-Furniture_Logo.png';


const Header = () => {



  return (
    <header className="bg-cream top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-auto">
          {/* Logo/Site Title */}
          <div className="flex items-center">
          <img 
              src={furnitureLogo} 
              alt="Furniture Logo" 
              className="h-20 w-auto mt-2"
            />
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-900 hover:text-dgreen font-medium">
              Home
            </a>
            <a href="#products" className="text-gray-900 hover:text-dgreen font-medium">
              Products
            </a>
            <a href="#about" className="text-gray-900 hover:text-dgreen font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-900 hover:text-dgreen font-medium">
              Contact
            </a>
          </nav>

          {/* User Icon (to navigate to login page) */}
          <div className="flex items-center space-x-4">
          <Link 
              to="/login"
              className="border hover:bg-lgreen hover:text-dgreen transition-all duration-200 rounded-xl px-6 py-2 font-medium text-m"
            >
              Login
            </Link>
          </div>
        </div>
      </div>


    </header>
  );
};

export default Header;
