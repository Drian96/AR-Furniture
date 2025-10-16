import React, { useState, useCallback } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Google from '../assets/google.jpg'; 
import SignUpBG from '../assets/SignUpBG.jpg';
import { twMerge } from 'tailwind-merge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleSuccessOk = useCallback(() => {
    setShowSuccessModal(false);
    // After successful login, redirect based on role
    const stored = localStorage.getItem('authToken');
    // Fallback: route to products for customers, admin to /admin
    // Since token may not be easily decoded here, rely on server-verified user in context by re-login return
    // We'll set a flag in session to indicate lastLoginRole via a custom event
    const role = sessionStorage.getItem('lastLoginRole');
    if (role === 'admin' || role === 'manager' || role === 'staff') {
      navigate('/admin');
    } else {
      navigate('/products');
    }
  }, [navigate]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const user = await login({ email, password });
      sessionStorage.setItem('lastLoginRole', user.role);
      if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
        navigate('/admin');
        return;
      }
      setShowSuccessModal(true);
      // Don't auto-redirect - wait for user to click OK button
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.message) {
        if (err.message.includes('Invalid email or password') || err.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('User not found')) {
          errorMessage = 'Email not found. Please check your email address.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, loading, login, navigate]);

  const handleGoogleLogin = useCallback(() => {
    // In a real application, this would trigger a Google OAuth flow
    navigate('/products');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
         style={{ backgroundImage: `url(${SignUpBG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className='absolute top-7 text-dgreen font-bold text-4xl font-serif w-full'>
        <h1 className='text-center'>AR-Furniture</h1>
      </div>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-dgreen mb-6 text-center">Login Now!</h2>
        <form onSubmit={handleLogin} noValidate>
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lgreen hover:bg-dgreen text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75 flex items-center justify-center cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LogIn className="mr-2" size={20} />
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-sm text-gray-900 hover:text-dgreen hover:underline transition-colors duration-200">
            Forgot password?
          </Link>
        </div>
        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
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
        <div className="text-center mt-6 text-gray-600">
          No account?{' '}
          <Link
            to="/signup"
            className="text-gray-900 hover:text-dgreen hover:underline font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Welcome Back!</h3>
              <p className="text-dgray mb-6">Login successful! Ready to continue shopping?</p>
              <button
                onClick={handleSuccessOk}
                className="w-full bg-dgreen text-white py-3 px-6 rounded-md hover:bg-lgreen transition-colors font-semibold cursor-pointer"
              >
                OK, Let's Go!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;