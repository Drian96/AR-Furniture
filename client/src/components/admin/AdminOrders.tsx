import { useState, useEffect } from 'react';
import { Search, X, Eye, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import { orderService, Order } from '../../services/supabase';

// Orders management component for admin
const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReturnManagement, setShowReturnManagement] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(order => order.status === selectedStatus.toLowerCase());
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
    try {
      setUpdatingStatus(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Refresh orders
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    await loadOrderItems(order.id);
  };

  const loadOrderItems = async (orderId: number) => {
    try {
      setLoadingOrderItems(true);
      const orderDetails = await orderService.getOrderWithDetails(orderId);
      setOrderItems(orderDetails.items);
    } catch (error) {
      console.error('Failed to load order items:', error);
      setOrderItems([]);
    } finally {
      setLoadingOrderItems(false);
    }
  };

  // State for return management
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);

  // Load return requests
  const loadReturnRequests = async () => {
    try {
      setLoadingReturns(true);
      // Get orders with return_refund status
      const returnOrders = orders.filter(order => order.status === 'return_refund');
      
      // Transform orders into return request format
      const requests = returnOrders.map(order => ({
        id: `RET-${order.id}`,
        orderId: order.order_number,
        customer: `${order.first_name} ${order.last_name}`,
        product: "Multiple items", // We could get product names from order items
        reason: "Customer requested return/refund",
        amount: `₱${order.total_amount.toLocaleString()}`,
        date: new Date(order.created_at).toLocaleDateString(),
        status: "Pending",
        order: order
      }));
      
      setReturnRequests(requests);
    } catch (error) {
      console.error('Failed to load return requests:', error);
    } finally {
      setLoadingReturns(false);
    }
  };

  // Handle return action (approve/decline)
  const handleReturnAction = async (returnId: string, action: 'approve' | 'decline') => {
    try {
      const request = returnRequests.find(req => req.id === returnId);
      if (!request) return;

      if (action === 'approve') {
        // Update order status to cancelled (refunded)
        await orderService.updateOrderStatus(request.order.id, 'cancelled');
      } else {
        // Update order status back to delivered
        await orderService.updateOrderStatus(request.order.id, 'delivered');
      }
      
      // Refresh orders and return requests
      await loadOrders();
      await loadReturnRequests();
      
      alert(`Return request ${action}d successfully.`);
    } catch (error) {
      console.error(`Failed to ${action} return request:`, error);
      alert(`Failed to ${action} return request. Please try again.`);
    }
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
          onClick={async () => {
            setShowReturnManagement(true);
            await loadReturnRequests();
          }}
          className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer"
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
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen cursor-pointer"
          >
            <option>All Status</option>
            <option>pending</option>
            <option>confirmed</option>
            <option>shipped</option>
            <option>delivered</option>
            <option>cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dgreen"></div>
              <p className="mt-2 text-dgray">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dgray">No orders found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-light">
                  <th className="text-left py-3 px-4 font-medium text-dgreen">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-dgreen">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-dgreen">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-dgreen">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-dgreen">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-dgreen">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-sage-light hover:bg-cream">
                    <td className="py-3 px-4 text-dgreen font-medium">{order.order_number}</td>
                    <td className="py-3 px-4 text-dgray">
                      <div>
                        <div className="font-medium">{order.first_name} {order.last_name}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-dgreen font-medium">₱{order.total_amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                        {updatingStatus === order.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dgreen"></div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-dgray text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="text-dgreen hover:text-opacity-70 cursor-pointer hover:scale-120"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Status Update Buttons */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            disabled={updatingStatus === order.id}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer hover:scale-110"
                            title="Confirm Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'shipped')}
                            disabled={updatingStatus === order.id}
                            className="text-purple-600 hover:text-purple-800 cursor-pointer hover:scale-110"
                            title="Mark as Shipped"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            disabled={updatingStatus === order.id}
                            className="text-green-600 hover:text-green-800 cursor-pointer hover:scale-110"
                            title="Mark as Delivered"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            disabled={updatingStatus === order.id}
                            className="text-red-600 hover:text-red-800 cursor-pointer hover:scale-110"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Order Details</h2>
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dgreen">Order Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{selectedOrder.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium text-dgreen">₱{selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="capitalize">{selectedOrder.payment_method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dgreen">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedOrder.first_name} {selectedOrder.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{selectedOrder.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{selectedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="text-right">{selectedOrder.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span>{selectedOrder.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Postal Code:</span>
                    <span>{selectedOrder.postal_code}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Notes:</span>
                      <span className="text-right">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-dgreen mb-4">Order Items</h3>
              {loadingOrderItems ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-dgreen"></div>
                  <p className="mt-2 text-gray-600">Loading order items...</p>
                </div>
              ) : orderItems.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">No items found for this order.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.product_image ? (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ₱{item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-dgreen">₱{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-dgreen cursor-pointer"
              >
                Close
              </button>
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Management Modal */}
      {/* TODO: When backend is ready, fetch real return requests */}
      {showReturnManagement && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
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
              {loadingReturns ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dgreen"></div>
                  <p className="mt-2 text-dgray">Loading return requests...</p>
                </div>
              ) : returnRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dgray">No return requests found.</p>
                </div>
              ) : (
                returnRequests.map((returnReq) => (
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
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleReturnAction(returnReq.id, 'approve')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;