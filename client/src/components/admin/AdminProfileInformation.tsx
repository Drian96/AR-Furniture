import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Admin profile information wired to auth context (same API as user profile)
const AdminProfileInformation = () => {
  const { user, updateProfile, isLoading } = useAuth();

  const initialState = useMemo(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }), [user]);

  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setForm(initialState); }, [initialState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialState), [form, initialState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving || isLoading) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      });
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Admin Profile Information</h2>

      {message && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{message}</div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dgreen mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dgreen mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dgreen mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full px-3 py-2 border border-sage-light rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dgreen mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={!isDirty || saving || isLoading} className="bg-dgreen text-cream px-6 py-2 rounded-lg hover:bg-lgreen cursor-pointer disabled:opacity-60">
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
          <button type="button" onClick={() => setForm(initialState)} disabled={saving} className="border border-lgreen text-dgray px-6 py-2 rounded-lg hover:border-dgreen cursor-pointer disabled:opacity-60">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileInformation;