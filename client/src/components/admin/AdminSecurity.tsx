// Admin security settings component
const AdminSecurity = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Admin Security</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-dgreen mb-4">Change Password</h3>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
        </div>
        <button className="bg-dgreen text-cream px-6 py-2 rounded-lg hover:bg-lgreen cursor-pointer">
          Update Password
        </button>
      </div>
    </div>
  );
};

export default AdminSecurity;