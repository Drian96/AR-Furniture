import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from './SignUpContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { RegisterRequest } from '../../../services/api';

interface FormData {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

const CompleteRegistration: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  
  // Debug: Log when modal state changes
  React.useEffect(() => {
    console.log('🔄 Success modal state changed:', showSuccessModal);
  }, [showSuccessModal]);
  const { email, resetSignup } = useSignup();
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuccessOk = (): void => {
    console.log('🎉 User clicked OK, navigating to products page');
    setShowSuccessModal(false);
    resetSignup(); // Reset signup context when user clicks OK
    navigate('/products'); // Redirect to products page instead of home
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData: RegisterRequest = {
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      };

      // Call the real API through AuthContext
      await register(userData);
      
      // Registration successful - show modal immediately
      console.log('✅ Registration successful, showing success modal');
      setShowSuccessModal(true);
      
      // Prevent any automatic redirects by staying on this page
      // The modal will handle the navigation when user clicks OK
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-dgreen">Complete Your Account</h2>
        
        <p className="text-dgray mb-6 text-center">
          Creating account for <strong>{email}</strong>
        </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-dgray text-sm font-bold mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-dgreen"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-dgray text-sm font-bold mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-dgreen"
            placeholder="Enter your last name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-dgray text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-dgreen"
            placeholder="Create a password"
            minLength={6}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-dgray text-sm font-bold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-dgreen"
            placeholder="Confirm your password"
            minLength={6}
            required
          />
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dgreen text-white py-2 px-4 rounded-md hover:bg-lgreen disabled:bg-gray-400 cursor-pointer"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>

    {/* Success Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dgreen mb-2">Welcome to AR-Furniture!</h3>
            <p className="text-dgray mb-6">Account created successfully! You can now explore our products and start shopping.</p>
            <button
              onClick={handleSuccessOk}
              className="w-full bg-dgreen text-white py-3 px-6 rounded-md hover:bg-lgreen transition-colors font-semibold cursor-pointer"
            >
              OK, Let's Start Shopping!
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default CompleteRegistration;