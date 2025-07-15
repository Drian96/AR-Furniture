const Settings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-dgreen">Email Notifications</h4>
            <p className="text-dgray text-sm">Receive email updates about your orders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-lgray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dgreen"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-dgreen">SMS Notifications</h4>
            <p className="text-dgray text-sm">Receive SMS updates about your orders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-lgray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dgreen"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;