import React, { useState } from 'react';

// PayMongo-supported payment methods (adjust as needed)
const PAYMONGO_METHODS = [
  'GCash',
  'Credit Card',
  'GrabPay',
  'Maya',
  'Online Banking',
  'BillEase',
  'ShopeePay',
  'PayMaya',
  'PayPal', // Add/remove as your PayMongo account supports
];

const AdminSystemSettings: React.FC = () => {
  // State for selected payment methods
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['GCash', 'Credit Card']);
  const [methodToAdd, setMethodToAdd] = useState('');

  // State for shipping rates
  const [baseRate, setBaseRate] = useState('');
  const [ratePerKg, setRatePerKg] = useState('');

  // Add a payment method if not already selected
  const handleAddMethod = () => {
    if (methodToAdd && !selectedMethods.includes(methodToAdd)) {
      setSelectedMethods([...selectedMethods, methodToAdd]);
      setMethodToAdd('');
    }
  };

  // Remove a payment method
  const handleDeleteMethod = (method: string) => {
    setSelectedMethods(selectedMethods.filter((m) => m !== method));
  };

  // Get available methods not already selected
  const availableMethods = PAYMONGO_METHODS.filter((m) => !selectedMethods.includes(m));

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Payment Methods Section */}
      <div className="bg-white rounded-lg shadow p-6 border border-sage-light">
        <h3 className="text-xl font-semibold text-dgreen mb-4">Payment Methods</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <select
            className="flex-1 p-2 rounded border border-sage-light bg-lgray text-dgreen focus:ring-2 focus:ring-dgreen"
            value={methodToAdd}
            onChange={(e) => setMethodToAdd(e.target.value)}
          >
            <option value="">Select payment method</option>
            {availableMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <button
            className="bg-dgreen text-white px-4 py-2 rounded hover:bg-lgreen transition-colors disabled:bg-gray-300"
            onClick={handleAddMethod}
            disabled={!methodToAdd}
          >
            Add
          </button>
        </div>
        <ul className="divide-y divide-sage-light">
          {selectedMethods.map((method) => (
            <li key={method} className="flex items-center justify-between py-2">
              <span className="text-dgreen font-medium">{method}</span>
              <button
                className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-xs"
                onClick={() => handleDeleteMethod(method)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Shipping Rate Settings Section */}
      <div className="bg-white rounded-lg shadow p-6 border border-sage-light">
        <h3 className="text-xl font-semibold text-dgreen mb-4">Shipping Rate Settings</h3>
        <div className="mb-4">
          <label className="block text-dgreen mb-1 font-medium">Base rate</label>
          <input
            type="number"
            className="w-40 p-2 rounded border border-sage-light bg-lgray text-dgreen focus:ring-2 focus:ring-dgreen"
            value={baseRate}
            onChange={(e) => setBaseRate(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-dgreen mb-1 font-medium">Rate per kg</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-40 p-2 rounded border border-sage-light bg-lgray text-dgreen focus:ring-2 focus:ring-dgreen"
              value={ratePerKg}
              onChange={(e) => setRatePerKg(e.target.value)}
              placeholder="0.00"
            />
            <span className="text-dgreen">/kg</span>
          </div>
        </div>
      </div>
      {/*
        TODO: Connect these settings to backend API to save changes.
        For now, this is just a UI component.
      */}
    </div>
  );
};

export default AdminSystemSettings;
