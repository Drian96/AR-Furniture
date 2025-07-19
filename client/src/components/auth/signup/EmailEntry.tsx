import { useState, type FormEvent } from 'react';
import { useSignup } from './SignUpContext';
import type { ApiResponse } from '../../../types/auth';

const EmailEntry: React.FC = () => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { setEmail, setCurrentStep } = useSignup();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, simulate success
      console.log('Sending verification to:', emailInput);
      
      // Simulate API response
      const data: ApiResponse = { success: true };

      if (data.success) {
        setEmail(emailInput);
        setCurrentStep(2);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-dgreen">Sign Up</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-dgray text-sm font-bold mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-dgreen"
            placeholder="Enter your email"
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
          {loading ? 'Sending...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default EmailEntry;