import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck } from 'lucide-react';

const ProfileInformation = () => {
  const { user, updateProfile, isLoading } = useAuth();

  // Local form state initialized from user
  const initialState = useMemo(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '', // read-only in this form
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'other',
  }), [user]);

  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync when user updates are fetched later
  useEffect(() => {
    setForm(initialState);
  }, [initialState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Determine if any field has changed from the initial state
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialState);
  }, [form, initialState]);

  // Submit handler opens confirmation first
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving || isLoading) return;
    setShowConfirm(true);
  };

  // Executes the actual update after confirmation
  const confirmUpdate = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: (form.gender as any) || undefined,
      });
      setMessage('Profile updated successfully');
      setShowConfirm(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Profile Information</h2>

      {message && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dgray font-medium mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full px-4 py-2 border border-lgray rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-lgray rounded-lg cursor-pointer"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2 mt-2 flex space-x-4">
          <button
            type="submit"
            disabled={!isDirty || saving || isLoading}
            className="bg-lgreen text-dgreen px-6 py-2 rounded-lg font-medium hover:bg-opacity-80 transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>

          <button
            type="button"
            onClick={() => setForm(initialState)}
            disabled={saving}
            className="border border-lgray text-dgray px-6 py-2 rounded-lg font-medium hover:bg-lgray hover:bg-opacity-20 cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Update Confirmation Modal (copied style from logout modal) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-lgreen rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-dgreen" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Update Profile</h3>
              <p className="text-dgray">
                Are you sure you want to save these changes to your profile?
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-lgreen text-dgray rounded-lg hover:border-dgreen cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-lgreen cursor-pointer"
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

export default ProfileInformation;