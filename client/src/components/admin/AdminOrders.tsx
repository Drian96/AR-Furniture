import { useState } from 'react';
import { Search, X, Eye } from 'lucide-react';

// Orders management component for admin
// TODO: When backend is connected, fetch real orders data from your Express API
const AdminOrders = () => {
  const [showReturnManagement, setShowReturnManagement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // TODO: Replace with actual orders data from backend API
  const orders = [
    {
      id: "ORD-2441",
      customer: "John Smith",
      items: "Davies Paint Polyurethane",
      total: "₱299.99",
      status: "Pending",
      date: "2024-01-15"
    },
    {
      id: "ORD-2440", 
      customer: "Sarah Wilson",
      items: "American Outlet",
      total: "₱74.50",
      status: "Processing",
      date: "2024-01-14"
    },
    {
      id: "ORD-2439",
      customer: "Mike Johnson", 
      items: "Steel tube",
      total: "₱125.00",
      status: "Shipped",
      date: "2024-01-13"
    }
  ];

  // TODO: Replace with actual return requests from backend
  const returnRequests = [
    {
      id: "RET001",
      orderId: "ORD-2024-001",
      customer: "John Smith",
      product: "Davies Paint Polyurethane",
      reason: "Defective product",
      amount: "₱299.99",
      date: "2024-01-05",
      status: "Pending"
    },
    {
      id: "RET002", 
      orderId: "ORD-2024-002",
      customer: "Sarah Wilson",
      product: "Garden Wilson",
      reason: "Wrong item received",
      amount: "₱185.00",
      date: "2024-01-04",
      status: "Pending"
    }
  ];

  // TODO: When backend is ready, implement actual return approval/decline
  const handleReturnAction = (returnId: string, action: 'approve' | 'decline') => {
    console.log(`${action} return ${returnId}`);
    // TODO: API call to update return status
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dgreen">Orders</h1>
          <p className="text-dgray mt-1">Manage customer orders and returns</p>
        </div>
        <button 
          onClick={() => setShowReturnManagement(true)}
          className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Return Management
        </button>
      </div>

      {/* Search and Filter Section */}
      {/* TODO: When backend is ready, implement real search and filtering */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        {/* TODO: When backend is ready, implement pagination and real-time updates */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-light">
                <th className="text-left py-3 px-4 font-medium text-dgreen">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Items</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Total</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Status</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-sage-light hover:bg-cream">
                  <td className="py-3 px-4 text-dgreen font-medium">{order.id}</td>
                  <td className="py-3 px-4 text-dgray">{order.customer}</td>
                  <td className="py-3 px-4 text-dgray">{order.items}</td>
                  <td className="py-3 px-4 text-dgreen font-medium">{order.total}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-dgreen hover:text-opacity-70 mr-2">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Management Modal */}
      {/* TODO: When backend is ready, fetch real return requests */}
      {showReturnManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Return Management</h2>
              <button 
                onClick={() => setShowReturnManagement(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {returnRequests.map((returnReq) => (
                <div key={returnReq.id} className="border border-sage-light rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-dgreen">{returnReq.id}</h3>
                      <p className="text-sm text-dgray">Order: {returnReq.orderId}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      {returnReq.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-dgray">Customer: {returnReq.customer}</p>
                      <p className="text-sm text-dgray">Product: {returnReq.product}</p>
                      <p className="text-sm text-dgray">Reason: {returnReq.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dgray">Amount: {returnReq.amount}</p>
                      <p className="text-sm text-dgray">Request Date: {returnReq.date}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReturnAction(returnReq.id, 'decline')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleReturnAction(returnReq.id, 'approve')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;