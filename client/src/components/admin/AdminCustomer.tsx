import { useState } from 'react';
import { Search, Eye, Edit, Trash2, X } from 'lucide-react';

// Customer management component for admin
// TODO: When backend is connected, fetch real customer data from your Express API
const AdminCustomer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // TODO: Replace with actual customer data from backend API
  const customers = [
    {
      id: "CUST001",
      name: "John Smith",
      email: "john@example.com",
      orders: 23,
      totalSpent: "₱7,450",
      lastOrder: "2024-01-15",
      status: "Active",
      phone: "+63 912 345 6789",
      address: "123 Main St, Manila"
    },
    {
      id: "CUST002", 
      name: "Sarah Wilson",
      email: "sarah@example.com",
      orders: 15,
      totalSpent: "₱4,200",
      lastOrder: "2024-01-10",
      status: "Active",
      phone: "+63 917 456 7890",
      address: "456 Oak Ave, Quezon City"
    },
    {
      id: "CUST003",
      name: "Mike Johnson",
      email: "mike@example.com", 
      orders: 8,
      totalSpent: "₱2,100",
      lastOrder: "2024-01-05",
      status: "Inactive",
      phone: "+63 918 567 8901",
      address: "789 Pine St, Makati"
    }
  ];

  // TODO: When backend is ready, implement actual customer details fetching
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
    // TODO: Fetch detailed customer data including order history
  };

  // TODO: When backend is ready, implement edit/delete functionality
  const handleEditCustomer = (customerId: string) => {
    console.log('Edit customer:', customerId);
    // TODO: Open edit modal with customer data
  };

  const handleDeleteCustomer = (customerId: string) => {
    console.log('Delete customer:', customerId);
    // TODO: Show confirmation dialog then API call to delete
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
          </div>
          <select className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
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
              {customers.map((customer) => (
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
                        onClick={() => handleEditCustomer(customer.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
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
                  <p className="text-sm text-dgray">Address: {selectedCustomer.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-dgreen mb-2">Order Statistics</h3>
                  <p className="text-sm text-dgray mb-1">Total Orders: {selectedCustomer.orders}</p>
                  <p className="text-sm text-dgray mb-1">Total Spent: {selectedCustomer.totalSpent}</p>
                  <p className="text-sm text-dgray mb-1">Last Order: {selectedCustomer.lastOrder}</p>
                  <p className="text-sm text-dgray">Status: {selectedCustomer.status}</p>
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
    </div>
  );
};

export default AdminCustomer;