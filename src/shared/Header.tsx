
import { Search, ShoppingCart } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-lgray shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-gray-900">
              AR-Furniture
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-900 hover:text-sage-medium transition-colors">
              Home
            </a>
            <a href="#products" className="text-gray-900 hover:text-sage-medium transition-colors">
              Products
            </a>
            <a href="#about" className="text-gray-900 hover:text-sage-medium transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-900 hover:text-sage-medium transition-colors">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="text-primary hover:text-sage-medium transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <button className="text-primary hover:text-sage-medium transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
