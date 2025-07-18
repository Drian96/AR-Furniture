import { useState } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

// User accounts management component for admin
// TODO: When backend is connected, fetch real user accounts data from your Express API
const AdminUserAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // TODO: Replace with actual user accounts data from backend API
  const userAccounts = [
    {
      id: "USR001",
      name: "John Smith", 
      email: "john@example.com",
      role: "Admin",
      lastLogin: "2024-01-15 10:30",
      status: "Active"
    },
    {
      id: "USR002",
      name: "Sarah Wilson",
      email: "sarah@example.com", 
      role: "Manager",
      lastLogin: "2024-01-14 09:15",
      status: "Active"
    },
    {
      id: "USR003",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Staff", 
      lastLogin: "2024-01-13 14:45",
      status: "Inactive"
    }
  ];

  // TODO: When backend is ready, implement actual user creation
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create new user account
    console.log('Creating new user account');
    setShowAddUserModal(false);
    setShowSuccessModal(true);
    
    // Auto-hide success modal after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  // TODO: When backend is ready, implement edit functionality
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
    // TODO: Pre-populate form with user data
  };

  const handleUpdateUser = (formData: any) => {
    console.log('Updating user:', selectedUser?.id, formData);
    // TODO: API call to update user (excluding password for security)
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  // TODO: When backend is ready, implement delete functionality
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    console.log('Deleting user:', selectedUser?.id);
    // TODO: API call to delete user account
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

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
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  required
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
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
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Position *</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                >
                  <option value="">Select position</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  required
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  required
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                />
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
                className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Success!</h3>
              <p className="text-dgray">User account has been created successfully.</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      {/* TODO: When backend is ready, implement actual form submission with pre-populated data */}
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
                handleUpdateUser({});
              }} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Name *</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    placeholder="Enter full name"
                    required
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Email *</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    placeholder="Email address"
                    required
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Position *</label>
                  <select 
                    defaultValue={selectedUser.role}
                    required
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  >
                    <option value="">Select position</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Status *</label>
                  <select 
                    defaultValue={selectedUser.status}
                    required
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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