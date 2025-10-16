import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Admin security settings wired to changePassword API
const AdminSecurity = () => {
  const { changePassword, isLoading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!strongPwd.test(newPassword)) {
      setError('Password must be 8+ chars and include upper, lower, and number');
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Admin Security</h2>
      {message && <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{message}</div>}
      {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-dgreen mb-2">Current Password</label>
          <Lock className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          />
          <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-3 top-10 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-dgreen mb-2">New Password</label>
          <Lock className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          />
          <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-10 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-dgreen mb-2">Confirm New Password</label>
          <Lock className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          />
          <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-10 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" disabled={saving || isLoading} className="bg-dgreen text-cream px-6 py-2 rounded-lg hover:bg-lgreen cursor-pointer disabled:opacity-60">
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default AdminSecurity;