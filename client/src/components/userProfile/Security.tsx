const Security = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Change Password</h2>
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-dgray font-medium mb-2">Current Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <button className="bg-dgreen text-cream px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
          Update Password
        </button>
      </div>
    </div>
  );
};

export default Security;