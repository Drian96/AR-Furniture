import React, { useState } from 'react';
import { Mail, Lock, UserPlus } from 'lucide-react';
import GoogleLogo from '../assets/google.jpg';
import { twMerge } from 'tailwind-merge';
import SignUpBG from '../assets/SignUpBG.jpg';
import { Link } from 'react-router-dom';

const SignUp: React.FC = () => {
  // State for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle Sign Up button click
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    // Basic validation: Check if passwords match
    if (password !== confirmPassword) {
      console.error('Passwords do not match!');
      // In a real app, you'd show a user-friendly error message on the UI
      return;
    }

    console.log('Attempting to sign up with:', { email, password });
    // In a real application, you would send this data to your authentication API
    // and handle success/failure, then redirect the user on success.
    // For now, we'll just log and simulate success.
    alert('Sign up successful! (Simulated)'); // Use a custom message box in production
    // Example: Redirect to login page or dashboard
    // window.location.href = '/login';
  };

  // Handle Google Sign Up button click
  const handleGoogleSignUp = () => {
    console.log('Attempting to sign up via Google');
    // In a real application, this would trigger a Google OAuth flow
  };

  return (
    // Main container for the sign-up page, centered on the screen
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        style={{ backgroundImage: `url(${SignUpBG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
      <div className='absolute top-7 text-dgreen font-bold text-4xl font-serif w-full'>
        <h1 className='text-center'>AR-Furniture</h1>
      </div>
      {/* Sign-up Form Container: White background, rounded corners, shadow, responsive sizing */}
      <div className="bg-white bg-opacity-10 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        {/* Page Header */}
        <h2 className="text-3xl font-bold text-dgreen mb-6 text-center">Create Your Account</h2>

        {/* Sign-up Form */}
        <form onSubmit={handleSignUp}>
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
          <div className="mb-4">
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

          {/* Confirm Password Input Field */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                id="confirmPassword"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-lgreen hover:bg-dgreen text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75 flex items-center justify-center cursor-pointer"
          >
            <UserPlus className="mr-2" size={20} />
            Sign Up
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Sign up via Google Button */}
        <button
          onClick={handleGoogleSignUp}
          className={twMerge(
            "w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3",
            "rounded-lg shadow-sm hover:bg-gray-200 transition duration-300 ease-in-out",
            "flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          )}
        >
          <img src={GoogleLogo} alt="Google logo" className='w-6 h-6 mr-2 rounded-full' />
          Sign up with Google
        </button>

        {/* Already have an account? Log in Link */}
        <div className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          {/* This link should ideally navigate to your login modal or dedicated login page */}
          <Link to="/" className="text-gray-900 hover:text-dgreen hover:underline font-medium transition-colors duration-200">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
