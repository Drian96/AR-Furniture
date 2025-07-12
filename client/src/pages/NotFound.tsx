import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
      <h1 className="text-9xl font-bold text-dgreen">404</h1>
      <h2 className="text-4xl font-semibold text-gray-800 mt-4 mb-2">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-lgreen hover:bg-dgreen text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
