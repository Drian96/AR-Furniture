const ProfileInformation = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dgray font-medium mb-2">First Name</label>
          <input
            type="text"
            defaultValue="John"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Last Name</label>
          <input
            type="text"
            defaultValue="Doe"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Email Address</label>
          <input
            type="email"
            defaultValue="john.doe@email.com"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            defaultValue="+1234567890"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            defaultValue="1990-01-01"
            className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
          />
        </div>
        <div>
          <label className="block text-dgray font-medium mb-2">Gender</label>
          <select className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex space-x-4">
        <button className="bg-lgreen text-dgreen px-6 py-2 rounded-lg font-medium hover:bg-opacity-80 transition-colors">
          Update Profile
        </button>
        <button className="border border-lgray text-dgray px-6 py-2 rounded-lg font-medium hover:bg-lgray hover:bg-opacity-20 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProfileInformation;