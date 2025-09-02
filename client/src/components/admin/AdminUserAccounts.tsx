import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { adminListUsers, adminCreateUser, adminDeleteUser, adminUpdateUser } from '../../services/api';

// User accounts management component for admin
// TODO: When backend is connected, fetch real user accounts data from your Express API
const AdminUserAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Add-user form state
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    contact: '',
    role: '', // 'admin' | 'manager' | 'staff'
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Edit-user form state
  const [editUser, setEditUser] = useState({
    fullName: '',
    email: '',
    role: '',
    status: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });

  const [userAccounts, setUserAccounts] = useState<Array<any>>([]);

  // Fetch users
  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminListUsers();
        const filtered = data.users.filter(u => u.role !== 'customer');
        const mapped = filtered.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: (u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1),
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-',
          status: (u.status || '').charAt(0).toUpperCase() + (u.status || '').slice(1),
        }));
        setUserAccounts(mapped);
      } catch (e) {
        console.error('Failed to load users', e);
      }
    };
    load();
  }, []);

  // TODO: When backend is ready, implement actual user creation
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation guard
    if (!isFormValid) return;
    // API call to create new user account
    adminCreateUser({
      fullName: newUser.fullName,
      email: newUser.email,
      contact: newUser.contact,
      role: newUser.role as 'admin' | 'manager' | 'staff',
      password: newUser.password,
    })
      .then(async () => {
        const data = await adminListUsers();
        const filtered = data.users.filter(u => u.role !== 'customer');
        const mapped = filtered.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: (u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1),
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-',
          status: (u.status || '').charAt(0).toUpperCase() + (u.status || '').slice(1),
        }));
        setUserAccounts(mapped);
      })
      .catch((e) => {
        console.error('Create user failed', e);
      });
    setShowAddUserModal(false);
    setSuccessMessage('User account has been created successfully.');
    setShowSuccessModal(true);
    
    // Auto-hide success modal after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    // Pre-populate form with user data
    setEditUser({
      fullName: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      contact: '', // We don't have contact in the table, so leave empty
      password: '',
      confirmPassword: ''
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (formData: any) => {
    if (!selectedUser) return;
    try {
      // Prepare the data for the API call
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };
      
      await adminUpdateUser(Number(selectedUser.id), updateData);
      setShowEditUserModal(false);
      setSelectedUser(null);
      
      // Refresh the user list
      const data = await adminListUsers();
      const filtered = data.users.filter(u => u.role !== 'customer');
      const mapped = filtered.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: (u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1),
        lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-',
        status: (u.status || '').charAt(0).toUpperCase() + (u.status || '').slice(1),
      }));
      setUserAccounts(mapped);
      
      // Show success message
      setSuccessMessage('User account has been updated successfully.');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (e) {
      console.error('Update user failed', e);
    }
  };

  // TODO: When backend is ready, implement delete functionality
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await adminDeleteUser(Number(selectedUser?.id));
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      const data = await adminListUsers();
      const filtered = data.users.filter(u => u.role !== 'customer');
      const mapped = filtered.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: (u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1),
        lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-',
        status: (u.status || '').charAt(0).toUpperCase() + (u.status || '').slice(1),
      }));
      setUserAccounts(mapped);
    } catch (e) {
      console.error('Delete user failed', e);
    }
  };

  // Derived validation state
  const emailValid = useMemo(() => /.+@.+\..+/.test(newUser.email), [newUser.email]);
  const passwordTooShort = useMemo(() => newUser.password.length > 0 && newUser.password.length < 8, [newUser.password]);
  const passwordsMismatch = useMemo(() => newUser.confirmPassword.length > 0 && newUser.password !== newUser.confirmPassword, [newUser.password, newUser.confirmPassword]);
  const requiredMissing = useMemo(() => !newUser.fullName || !newUser.email || !newUser.contact || !newUser.role || !newUser.password || !newUser.confirmPassword, [newUser]);
  const isFormValid = useMemo(() => !requiredMissing && emailValid && !passwordTooShort && !passwordsMismatch, [requiredMissing, emailValid, passwordTooShort, passwordsMismatch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dgreen">User Management</h1>
          <p className="text-dgray mt-1">Manage system user accounts and permissions</p>
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Search Section */}
      {/* TODO: When backend is ready, implement real search functionality */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <select className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        {/* TODO: When backend is ready, implement pagination and sorting */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-light">
                <th className="text-left py-3 px-4 font-medium text-dgreen">Name</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Email</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Role</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Status</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userAccounts.map((user) => (
                <tr key={user.id} className="border-b border-sage-light hover:bg-cream">
                  <td className="py-3 px-4 text-dgreen font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-dgray">{user.email}</td>
                  <td className="py-3 px-4 text-dgray">{user.role}</td>
                  <td className="py-3 px-4 text-dgray">{user.lastLogin}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    {/* Add New User Modal */}
    {showAddUserModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dgreen">Add New User</h2>
            <button 
              onClick={() => setShowAddUserModal(false)}
              className="text-dgray hover:text-dgreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${emailValid || newUser.email.length === 0 ? 'border-sage-light focus:ring-dgreen' : 'border-red-300 focus:ring-red-500'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Contact Number *</label>
                <input
                  type="tel"
                  placeholder="Enter contact number"
                  required
                  value={newUser.contact}
                  onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Position *</label>
                <select 
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: (e.target.value || '').toLowerCase() })}
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                >
                  <option value="">Select position</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className={`w-full pr-12 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${passwordTooShort ? 'border-red-300 focus:ring-red-500' : 'border-sage-light focus:ring-dgreen'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordTooShort && (
                  <p className="mt-1 text-sm text-red-600">Password must be at least 8 characters.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    required
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    className={`w-full pr-12 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${passwordsMismatch ? 'border-red-300 focus:ring-red-500' : 'border-sage-light focus:ring-dgreen'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordsMismatch && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match.</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${isFormValid ? 'bg-dgreen text-cream hover:bg-opacity-90' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              >
                Add New User
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Success!</h3>
              <p className="text-dgray">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Delete User Account</h3>
              <p className="text-dgray">
                Are you sure you want to delete <span className="font-medium">{selectedUser.name}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Edit User Account</h2>
              <button 
                onClick={() => setShowEditUserModal(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(editUser);
              }} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Name *</label>
                  <input
                    type="text"
                    value={editUser.fullName}
                    placeholder="Enter full name"
                    required
                    onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Email *</label>
                  <input
                    type="email"
                    value={editUser.email}
                    placeholder="Email address"
                    required
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Position *</label>
                  <select 
                    value={editUser.role}
                    required
                    onChange={(e) => setEditUser({ ...editUser, role: (e.target.value || '').toLowerCase() })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  >
                    <option value="">Select position</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Status *</label>
                  <select 
                    value={editUser.status}
                    required
                    onChange={(e) => setEditUser({ ...editUser, status: (e.target.value || '').toLowerCase() })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="bg-sage-medium rounded-lg p-4 mt-2">
                <p className="text-sm text-dgreen font-medium mb-1">Security Note:</p>
                <p className="text-xs text-dgreen opacity-80">
                  Password cannot be edited here for security reasons. User must reset their own password.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserAccounts;