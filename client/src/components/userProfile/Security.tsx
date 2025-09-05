import { useState, useMemo } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Security = () => {
  const { changePassword, isLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // show/hide confirm password text
  const [showConfirmModal, setShowConfirmModal] = useState(false); // confirmation modal state

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Client-side mirror of backend password rules
  const isStrongPassword = useMemo(() => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword);
  }, [newPassword]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (!isStrongPassword) {
      setError('Password must be 8+ chars, with upper, lower, and a number.');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmChange = async () => {
    try {
      setSaving(true);
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    visible: boolean,
    setVisible: (v: boolean) => void,
    name: string
  ) => (
    <div>
      <label className="block text-dgray font-medium mb-2">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen pr-10"
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-dgray hover:text-dgreen"
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Change Password</h2>

      {message && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {message}
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Success</h3>
              <p className="text-dgray">Your password has been updated.</p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        {renderPasswordField('Current Password', currentPassword, setCurrentPassword, showCurrent, setShowCurrent, 'currentPassword')}
        {renderPasswordField('New Password', newPassword, setNewPassword, showNew, setShowNew, 'newPassword')}
        {renderPasswordField('Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, 'confirmPassword')}

        <button
          className="bg-dgreen text-cream px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-60"
          type="submit"
          disabled={saving || isLoading}
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {/* Confirmation Modal (styled similarly to logout) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-lgreen rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-dgreen" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Change Password</h3>
              <p className="text-dgray">Are you sure you want to update your password?</p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmChange}
                className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;