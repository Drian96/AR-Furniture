import React from 'react';
import SignUpBG from '../assets/SignUpBG.jpg';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
         style={{ backgroundImage: `url(${SignUpBG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className='absolute top-7 text-dgreen font-bold text-4xl font-serif w-full'>
        <h1 className='text-center'>AR-Furniture</h1>
      </div>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-dgreen mb-4 text-center">Terms & Conditions</h2>
        <div className="prose max-w-none">
          <p className="mb-3">Welcome to AR-Furniture. By creating an account or using our services, you agree to the following terms.</p>
          <h3 className="text-xl font-semibold mt-4 mb-2">1. Account</h3>
          <p className="mb-2">You are responsible for maintaining the confidentiality of your account and password.</p>
          <h3 className="text-xl font-semibold mt-4 mb-2">2. Privacy</h3>
          <p className="mb-2">We process your personal data in accordance with our privacy practices to provide and improve our services.</p>
          <h3 className="text-xl font-semibold mt-4 mb-2">3. Acceptable Use</h3>
          <p className="mb-2">Do not misuse our services or attempt to access them using methods other than the interface and instructions provided.</p>
          <h3 className="text-xl font-semibold mt-4 mb-2">4. Purchases</h3>
          <p className="mb-2">All purchases are subject to availability and our store policies.</p>
          <h3 className="text-xl font-semibold mt-4 mb-2">5. Changes</h3>
          <p className="mb-2">We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.</p>
        </div>
        <div className="text-center mt-6">
          <Link to="/signup" className="text-dgreen hover:underline">Back to Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;


