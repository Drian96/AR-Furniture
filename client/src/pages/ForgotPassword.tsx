import React, { useState, useEffect, useCallback } from 'react';
import SignUpBG from '../assets/SignUpBG.jpg';
import { Mail, Hash, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { sendVerificationCode, verifyCode, resetPassword } from '../services/api';

type Step = 1 | 2 | 3;

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (step !== 2) return; 
    setCanResend(false);
    setCountdown(120);
  }, [step]);

  useEffect(() => {
    if (step !== 2) return; 
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown((v) => v - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend, step]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await sendVerificationCode(email);
      if (!res.success) throw new Error(res.message || 'Failed to send code');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyCode(email, code);
      if (!res.success) throw new Error(res.message || 'Invalid code');
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [email, code]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      const res = await sendVerificationCode(email);
      if (!res.success) throw new Error(res.message || 'Failed to resend code');
      setCanResend(false);
      setCountdown(120);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [email, canResend]);

  const handleReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPwd.test(newPassword)) {
      setError('Password must be 8+ chars and include upper, lower, and number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await resetPassword(email, code, newPassword);
      if (!res.success) throw new Error(res.message || 'Failed to reset password');
      setSuccessMsg('Password reset successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [email, code, newPassword, confirmPassword, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
         style={{ backgroundImage: `url(${SignUpBG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className='absolute top-7 text-dgreen font-bold text-4xl font-serif w-full'>
        <h1 className='text-center'>AR-Furniture</h1>
      </div>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <Link to="/login" className="text-dgreen hover:underline flex items-center">
            <ArrowLeft className="mr-1" size={18} /> Back
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-dgreen mb-6 text-center">Forgot Password</h2>

        {step === 1 && (
          <form onSubmit={handleSend} noValidate>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  required
                />
              </div>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-lgreen hover:bg-dgreen text-white font-semibold py-3 rounded-lg cursor-pointer disabled:bg-gray-400">
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} noValidate>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Verification Code</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); if (error) setError(''); }}
                  required
                />
                <button type="button" disabled={!canResend || loading} onClick={handleResend} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-dgreen hover:underline disabled:text-gray-400">
                  {canResend ? 'Resend' : `Resend in ${countdown}s`}
                </button>
              </div>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-lgreen hover:bg-dgreen text-white font-semibold py-3 rounded-lg cursor-pointer disabled:bg-gray-400">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} noValidate>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-transparent"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">{successMsg}</div>}
            <button type="submit" disabled={loading} className="w-full bg-lgreen hover:bg-dgreen text-white font-semibold py-3 rounded-lg cursor-pointer disabled:bg-gray-400">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;


