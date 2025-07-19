import React, { useState, useEffect, type FormEvent } from 'react';
import { useSignup } from './SignUpContext';
import type { ApiResponse } from '../../../types/auth';

const VerificationCode: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [canResend, setCanResend] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(120);
  const { email, setIsEmailVerified, setCurrentStep } = useSignup();

  // Countdown timer for resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, simulate success
      console.log('Verifying code:', code, 'for email:', email);
      
      // Simulate API response
      const data: ApiResponse = { success: true };

      if (data.success) {
        setIsEmailVerified(true);
        setCurrentStep(3);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    setLoading(true);
    setError('');
    
    try {
      // TODO: Replace with actual API call when backend is ready
      console.log('Resending verification to:', email);
      
      // Simulate success
      setCanResend(false);
      setCountdown(120);
      setCode('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-dgreen">Verify Your Email</h2>
      
      <p className="text-gray-600 mb-6 text-center">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-center text-lg tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Resend Code
            </button>
          ) : (
            <span className="text-gray-500 text-sm">
              Resend in {countdown}s
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default VerificationCode;