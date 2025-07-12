import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import Google from '../assets/google.jpg'; 
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

// Define the props for the LoginModal component
interface LoginModalProps {
  isOpen: boolean; // Controls whether the modal is visible
  onClose: () => void; // Function to call when the modal needs to be closed
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  // State for email and password input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  // Handle login button click
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    console.log('Attempting to log in with:', { email, password });
    // In a real application, you would send this data to your authentication API
    // and handle success/failure, then close the modal on success.
    // For now, we'll just close it for demonstration.
    onClose();
  };

  // Handle Google login button click
  const handleGoogleLogin = () => {
    console.log('Attempting to sign in via Google');
    // In a real application, this would trigger a Google OAuth flow
    onClose();
  };

  return (
    // Modal Overlay: Fixed position to cover the entire screen, now with bg-opacity-0
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Modal Content Container: White background, rounded corners, shadow, responsive sizing */}
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto transform transition-all duration-300 ease-out scale-100 opacity-100">
        {/* Close Button: Absolute position, top right corner, rounded, subtle hover effect */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <h2 className="text-3xl font-bold text-dgreen mb-6 text-center">Login Now!</h2>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email Input Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent transition duration-200"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                id="password"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-lgreen hover:bg-dgreen text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75 flex items-center justify-center cursor-pointer"
          >
            <LogIn className="mr-2" size={20} />
            Log In
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <a href="#" className="text-sm text-gray-900 hover:text-dgreen hover:underline transition-colors duration-200">
            Forgot password?
          </a>
        </div>

        {/* Separator */}
        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Sign in via Google Button - Corrected to use Lucide icon */}
        <button
          onClick={handleGoogleLogin}
          className={twMerge(
            "w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3",
            "rounded-lg shadow-sm hover:bg-gray-200 transition duration-300 ease-in-out",
            "flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          )}
        >
          <img src={Google} alt="Google logo" className='w-6 h-6 mr-2 rounded-full' />
          Sign in with Google
        </button>

        {/* No Account? Sign Up Link */}
        <div className="text-center mt-6 text-gray-600">
          No account?{' '}
          <Link
            to="/signup" // This is the route path, not the file path
            onClick={onClose} // Optionally close the modal when navigating
            className="text-gray-900 hover:text-dgreen hover:underline font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
