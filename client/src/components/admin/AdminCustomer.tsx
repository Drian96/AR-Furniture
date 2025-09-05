import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, X, CheckCircle, MapPin } from 'lucide-react';
import { adminListUsers, adminUpdateUser, adminDeleteUser, getAddressesByUserId } from '../../services/api';

// Customer management component for admin
const AdminCustomer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Edit customer form state
  const [editCustomer, setEditCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    address: ''
  });

  // Fetch customers from database
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await adminListUsers();
        // Filter only customers (role = 'customer')
        const customerUsers = data.users.filter((u: any) => u.role === 'customer');
        
        // Map the data to match our component structure
        const mappedCustomers = customerUsers.map((u: any) => ({
          id: u.id,
          name: `${u.firstName || u.first_name} ${u.lastName || u.last_name}`,
          email: u.email,
          phone: u.phone || 'N/A',
          address: 'N/A', // Address field not available in current User model
          orders: 0, // Orders field not available in current User model
          totalSpent: '₱0', // Total spent field not available in current User model
          lastOrder: 'N/A', // Last order field not available in current User model
          status: (u.status || 'active').charAt(0).toUpperCase() + (u.status || 'active').slice(1),
          firstName: u.firstName || u.first_name,
          lastName: u.lastName || u.last_name
        }));
        
        setCustomers(mappedCustomers);
      } catch (error) {
        console.error('Failed to load customers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Filter customers based on search term and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    return matchesSearch;
  });

  // Fetch customer details including addresses
  const handleViewCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
    
    // Fetch customer addresses
    try {
      setLoadingAddresses(true);
      const addresses = await getAddressesByUserId(customer.id);
      setCustomerAddresses(addresses);
    } catch (error) {
      console.error('Failed to load customer addresses:', error);
      setCustomerAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Handle edit customer - populate form with customer data
  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    // Pre-populate form with customer data
    setEditCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      address: customer.address
    });
    setShowEditCustomer(true);
  };

  const handleDeleteCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await adminDeleteUser(Number(selectedCustomer?.id));
      setShowDeleteConfirm(false);
      setSelectedCustomer(null);
      
      // Refresh customer list
      const data = await adminListUsers();
      const customerUsers = data.users.filter((u: any) => u.role === 'customer');
      const mappedCustomers = customerUsers.map((u: any) => ({
        id: u.id,
        name: `${u.firstName || u.first_name} ${u.lastName || u.last_name}`,
        email: u.email,
        phone: u.phone || 'N/A',
        address: 'N/A', // Address field not available in current User model
        orders: 0, // Orders field not available in current User model
        totalSpent: '₱0', // Total spent field not available in current User model
        lastOrder: 'N/A', // Last order field not available in current User model
        status: (u.status || 'active').charAt(0).toUpperCase() + (u.status || 'active').slice(1),
        firstName: u.firstName || u.first_name,
        lastName: u.lastName || u.last_name
      }));
      setCustomers(mappedCustomers);
      
      // Show success message
      setSuccessMessage('Customer has been deleted successfully.');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      setSuccessMessage('Failed to delete customer. Please try again.');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    }
  };

  const handleUpdateCustomer = async (formData: any) => {
    try {
      // Split the full name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Prepare the data for the API call
      const updateData = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        status: formData.status.toLowerCase()
      };
      
      await adminUpdateUser(Number(selectedCustomer.id), updateData);
      setShowEditCustomer(false);
      setSelectedCustomer(null);
      
      // Refresh customer list
      const data = await adminListUsers();
      const customerUsers = data.users.filter((u: any) => u.role === 'customer');
      const mappedCustomers = customerUsers.map((u: any) => ({
        id: u.id,
        name: `${u.firstName || u.first_name} ${u.lastName || u.last_name}`,
        email: u.email,
        phone: u.phone || 'N/A',
        address: 'N/A', // Address field not available in current User model
        orders: 0, // Orders field not available in current User model
        totalSpent: '₱0', // Total spent field not available in current User model
        lastOrder: 'N/A', // Last order field not available in current User model
        status: (u.status || 'active').charAt(0).toUpperCase() + (u.status || 'active').slice(1),
        firstName: u.firstName || u.first_name,
        lastName: u.lastName || u.last_name
      }));
      setCustomers(mappedCustomers);
      
      // Show success message
      setSuccessMessage('Customer information has been updated successfully.');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update customer:', error);
      setSuccessMessage('Failed to update customer. Please try again.');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Customer Management</h1>
        <p className="text-dgray mt-1">Manage your customers and their information</p>
      </div>

      {/* Search Section */}
      {/* TODO: When backend is ready, implement real search functionality */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dgray hover:text-dgreen"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        
        {/* Customer count */}
        <div className="mb-4 text-sm text-dgray">
          Showing {filteredCustomers.length} of {customers.length} customers
          {searchTerm && ` matching "${searchTerm}"`}
        </div>

        {/* Customers Table */}
        {/* TODO: When backend is ready, implement pagination and sorting */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-light">
                <th className="text-left py-3 px-4 font-medium text-dgreen">Name</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Email</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Total Spent</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Last Order</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Status</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-dgray">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-sage-light hover:bg-cream">
                    <td className="py-3 px-4 text-dgreen font-medium">{customer.name}</td>
                    <td className="py-3 px-4 text-dgray">{customer.email}</td>
                    <td className="py-3 px-4 text-dgray">{customer.orders}</td>
                    <td className="py-3 px-4 text-dgreen font-medium">{customer.totalSpent}</td>
                    <td className="py-3 px-4 text-dgray">{customer.lastOrder}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditCustomer(customer)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-dgray">
                    {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {/* TODO: When backend is ready, fetch detailed customer info and order history */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Customer Details</h2>
              <button 
                onClick={() => setShowCustomerDetails(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-dgreen mb-2">Personal Information</h3>
                  <p className="text-sm text-dgray mb-1">Name: {selectedCustomer.name}</p>
                  <p className="text-sm text-dgray mb-1">Email: {selectedCustomer.email}</p>
                  <p className="text-sm text-dgray mb-1">Phone: {selectedCustomer.phone}</p>
                  <p className="text-sm text-dgray">Status: {selectedCustomer.status}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-dgreen mb-2">Order Statistics</h3>
                  <p className="text-sm text-dgray mb-1">Total Orders: {selectedCustomer.orders}</p>
                  <p className="text-sm text-dgray mb-1">Total Spent: {selectedCustomer.totalSpent}</p>
                  <p className="text-sm text-dgray mb-1">Last Order: {selectedCustomer.lastOrder}</p>
                  <p className="text-sm text-dgray">Customer ID: {selectedCustomer.id}</p>
                </div>
              </div>

              {/* Customer Addresses Section */}
              <div>
                <h3 className="font-semibold text-dgreen mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Customer Addresses
                </h3>
                <div className="bg-cream rounded-lg p-4">
                  {loadingAddresses ? (
                    <p className="text-sm text-dgray">Loading addresses...</p>
                  ) : customerAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {customerAddresses.map((address, index) => (
                        <div key={address.id} className="border border-sage-light rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-dgreen">{address.recipient_name}</span>
                                {address.is_default && (
                                  <span className="bg-dgreen text-cream text-xs px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                                <span className="bg-sage-light text-dgreen text-xs px-2 py-1 rounded-full">
                                  {address.address_type}
                                </span>
                              </div>
                              {address.phone && (
                                <p className="text-sm text-dgray mb-1">Phone: {address.phone}</p>
                              )}
                              <p className="text-sm text-dgray">
                                {address.street_address && `${address.street_address}, `}
                                {address.barangay && `${address.barangay}, `}
                                {address.city && `${address.city}, `}
                                {address.province && `${address.province}, `}
                                {address.region && `${address.region}`}
                                {address.postal_code && ` ${address.postal_code}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-dgray">No addresses found for this customer.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-dgreen mb-2">Recent Orders</h3>
                <div className="bg-cream rounded-lg p-4">
                  <p className="text-sm text-dgray">Order history will be loaded from backend</p>
                  <p className="text-xs text-dgray mt-1">TODO: Implement order history API</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomer && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Edit Customer Information</h2>
              <button 
                onClick={() => setShowEditCustomer(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCustomer(editCustomer);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editCustomer.name}
                    placeholder="Enter full name"
                    required
                    onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editCustomer.email}
                    placeholder="Enter email"
                    required
                    onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editCustomer.phone}
                    placeholder="Enter phone number"
                    onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Status</label>
                  <select 
                    value={editCustomer.status}
                    onChange={(e) => setEditCustomer({ ...editCustomer, status: e.target.value })}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Address</label>
                <textarea
                  rows={3}
                  value={editCustomer.address}
                  placeholder="Enter address"
                  onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                ></textarea>
              </div>

              <div className="bg-cream rounded-lg p-4">
                <p className="text-sm text-dgray font-medium mb-1">Security Note:</p>
                <p className="text-xs text-dgray">
                  Password cannot be edited here for security reasons. Customer must reset their own password.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditCustomer(false)}
                  className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Delete Customer</h3>
              <p className="text-dgray">
                Are you sure you want to delete <span className="font-medium">{selectedCustomer.name}</span>? 
                This action cannot be undone and will remove all customer data and order history.
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

      {/* Success Modal */}
      {showSuccessModal && successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Success!</h3>
              <p className="text-dgray">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomer;