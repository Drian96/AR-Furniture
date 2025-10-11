import { Twitter, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-lgray">
      <div className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              ONEIRIC
            </h3>
            <p className="text-gray-900 mb-4">
              Sustainable furniture for conscious living. Creating beautiful spaces that respect our planet.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-900 hover:text-sage-medium transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://www.facebook.com/KamilFAngeles" className="text-gray-900 hover:text-sage-medium transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-900 hover:text-sage-medium transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-900">
              <li><a href="#" className="hover:text-dgreen">Living Room</a></li>
              <li><a href="#" className="hover:text-dgreen">Dining Room</a></li>
              <li><a href="#" className="hover:text-dgreen">Bedroom</a></li>
              <li><a href="#" className="hover:text-dgreen">Office</a></li>
              <li><a href="#" className="hover:text-dgreen">Accessories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-gray-900">
              <li><a href="#" className="hover:text-dgreen">About Us</a></li>
              <li><a href="#" className="hover:text-dgreen">Sustainability</a></li>
              <li><a href="#" className="hover:text-dgreen">Careers</a></li>
              <li><a href="#" className="hover:text-dgreen">Press</a></li>
              <li><a href="#" className="hover:text-dgreen">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-gray-900">
              <li><a href="#" className="hover:text-dgreen">Contact Us</a></li>
              <li><a href="#" className="hover:text-dgreen">Shipping Info</a></li>
              <li><a href="#" className="hover:text-dgreen">Returns</a></li>
              <li><a href="#" className="hover:text-dgreen">Size Guide</a></li>
              <li><a href="#" className="hover:text-dgreen">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-sage-medium pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-900 text-sm">
              © 2025 ONEIRIC. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-900">
              <a href="#" className="hover:text-sage-dark transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-sage-dark transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-sage-dark transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
