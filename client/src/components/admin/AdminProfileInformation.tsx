// Admin profile information component - similar to user profile but with admin-specific fields
// TODO: When backend is connected, fetch admin profile data from your Express API
const AdminProfileInformation = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Admin Profile Information</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dgreen mb-2">First Name</label>
            <input
              type="text"
              defaultValue="Admin"
              className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dgreen mb-2">Last Name</label>
            <input
              type="text"
              defaultValue="User"
              className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dgreen mb-2">Admin Email</label>
          <input
            type="email"
            defaultValue="admin@shop.com"
            className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dgreen mb-2">Admin Role</label>
          <select className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen">
            <option>Administrator</option>
            <option>Super Admin</option>
            <option>Manager</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button className="bg-dgreen text-cream px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
            Update Profile
          </button>
          <button className="border border-sage-light text-dgray px-6 py-2 rounded-lg hover:bg-sage-light transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileInformation;