import { useState } from 'react';

const MyAddress = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const addresses = [
    {
      id: 1,
      name: 'Edrian Angeles',
      address: 'Angeles St. KM38, Pulong Buhangin, Sta. Maria, Bulacan',
      isDefault: true,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-dgreen">My Addresses</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="border border-lgray rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-dgreen">{address.name}</h4>
                <p className="text-dgray mt-1">{address.address}</p>
                {address.isDefault && (
                  <span className="inline-block mt-2 px-3 py-1 bg-lgreen text-dgreen text-sm rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button className="text-dgreen hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
                {!address.isDefault && (
                  <button className="text-dgreen hover:underline">Set as default</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-dgreen mb-4">New Address</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
                />
              </div>
              <select className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen">
                <option>Region, Province, City, Barangay</option>
              </select>
              <input
                type="text"
                placeholder="Postal Code"
                className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
              />
              <textarea
                placeholder="Street Name, Building, House No."
                className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen h-24 resize-none"
              />
              <div>
                <p className="text-dgray font-medium mb-2">Label As:</p>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="label" value="home" className="mr-2" />
                    <span className="text-dgray">Home</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="label" value="work" className="mr-2" />
                    <span className="text-dgray">Work</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-lgray text-dgray rounded-lg hover:bg-lgray hover:bg-opacity-20 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddress;