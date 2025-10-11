import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService, reviewService, Order } from '../../services/supabase';
import { Package, Eye, X } from 'lucide-react';

const MyPurchase = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<number, any[]>>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showOrderReceivedConfirm, setShowOrderReceivedConfirm] = useState(false);
  const [showReturnRequestConfirm, setShowReturnRequestConfirm] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [actionOrder, setActionOrder] = useState<Order | null>(null);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'return_refund', label: 'Return Refund' },
  ];

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userOrders = await orderService.getUserOrders(user.id);
        setOrders(userOrders);
        
        // Load order items for each order
        const itemsMap: Record<number, any[]> = {};
        for (const order of userOrders) {
          try {
            const orderDetails = await orderService.getOrderWithDetails(order.id);
            itemsMap[order.id] = orderDetails.items;
          } catch (error) {
            console.error(`Failed to load items for order ${order.id}:`, error);
            itemsMap[order.id] = [];
          }
        }
        setOrderItemsMap(itemsMap);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'return_refund': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrderDetails = async (order: Order) => {
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

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!actionOrder) return;
    
    try {
      await orderService.updateOrderStatus(actionOrder.id, 'cancelled');
      // Refresh orders
      const userOrders = await orderService.getUserOrders(user!.id);
      setOrders(userOrders);
      setShowCancelConfirm(false);
      setActionOrder(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  // Handle order received
  const handleOrderReceived = async () => {
    if (!actionOrder) return;
    
    try {
      await orderService.updateOrderStatus(actionOrder.id, 'completed');
      // Refresh orders
      const userOrders = await orderService.getUserOrders(user!.id);
      setOrders(userOrders);
      setShowOrderReceivedConfirm(false);
      setActionOrder(null);
    } catch (error) {
      console.error('Failed to mark order as received:', error);
      alert('Failed to mark order as received. Please try again.');
    }
  };

  // Handle return/refund request
  const handleReturnRequest = async () => {
    if (!actionOrder) return;
    
    try {
      // Update order status to return_refund
      await orderService.updateOrderStatus(actionOrder.id, 'return_refund');
      // Refresh orders
      const userOrders = await orderService.getUserOrders(user!.id);
      setOrders(userOrders);
      setShowReturnRequestConfirm(false);
      setActionOrder(null);
    } catch (error) {
      console.error('Failed to request return/refund:', error);
      alert('Failed to request return/refund. Please try again.');
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (!actionOrder || rating === 0 || !user) {
      alert('Please select a rating.');
      return;
    }
    
    try {
      // Get order items to create reviews for each product
      const orderDetails = await orderService.getOrderWithDetails(actionOrder.id);
      
      // Create reviews for each product in the order
      for (const item of orderDetails.items) {
        // Check if user has already reviewed this product from this order
        const hasReviewed = await reviewService.hasUserReviewedProduct(actionOrder.id, item.product_id);
        
        if (!hasReviewed) {
          await reviewService.createReview({
            order_id: actionOrder.id,
            product_id: item.product_id,
            user_id: user.id,
            rating: rating,
            comment: ratingComment
          });
        }
      }
      
      alert('Thank you for your rating! Your review has been submitted.');
      setShowRatingModal(false);
      setActionOrder(null);
      setRating(0);
      setRatingComment('');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">My Purchase</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="You can search by Order ID or Product name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
        />
      </div>

      {/* Status Tabs */}
      <div className="border-b border-lgray mb-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-dgreen text-dgreen'
                  : 'border-transparent text-dgray hover:text-dgreen'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dgreen"></div>
            <p className="mt-2 text-dgray">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-dgray">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
          <div key={order.id} className="border border-lgray rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-dgray">Order #{order.order_number}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            
              {/* Order Items Preview */}
              <div className="mt-4">
                {orderItemsMap[order.id] && orderItemsMap[order.id].length > 0 ? (
                  <div className="space-y-2">
                    {orderItemsMap[order.id].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.product_image ? (
                            <img 
                              src={item.product_image} 
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
              <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: ₱{item.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-dgreen">₱{(item.price * item.quantity).toLocaleString()}</p>
              </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-dgray">
                    <span className="font-medium">Total Amount:</span> ₱{order.total_amount.toLocaleString()}
                    <br />
                    <span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}
                  </div>
                )}
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
                <button 
                  onClick={() => handleViewOrderDetails(order)}
                  className="px-4 py-2 border border-dgreen text-dgreen rounded-lg hover:bg-dgreen hover:text-white cursor-pointer flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                
                {/* Pending orders - Cancel button */}
                {order.status === 'pending' && (
                  <button 
                    onClick={() => {
                      setActionOrder(order);
                      setShowCancelConfirm(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
                
                {/* Delivered orders - Order Received and Return Request buttons */}
                {order.status === 'delivered' && (
                  <>
                    <button 
                      onClick={() => {
                        setActionOrder(order);
                        setShowOrderReceivedConfirm(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Order Received
                    </button>
                    <button 
                      onClick={() => {
                        setActionOrder(order);
                        setShowReturnRequestConfirm(true);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
                    >
                      Request Return/Refund
                    </button>
                  </>
                )}
                
                {/* Completed orders - Rate button */}
                {order.status === 'completed' && (
                  <button 
                    onClick={() => {
                      setActionOrder(order);
                      setShowRatingModal(true);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
                  >
                Rate
              </button>
                )}
              </div>
            </div>
          ))
        )}
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
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
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

              {/* Delivery Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dgreen">Delivery Information</h3>
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
                className="px-4 py-2 border border-lgreen text-gray-700 rounded-lg hover:border-dgreen cursor-pointer"
              >
                Close
              </button>
              {selectedOrder.status === 'pending' && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirm && actionOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-dgreen">Cancel Order</h3>
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel order #{actionOrder.order_number}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Received Confirmation Modal */} 
      {showOrderReceivedConfirm && actionOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-dgreen">Order Received</h3>
              <button 
                onClick={() => setShowOrderReceivedConfirm(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Confirm that you have received order #{actionOrder.order_number}? This will mark the order as completed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowOrderReceivedConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderReceived}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Yes, Order Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return/Refund Request Confirmation Modal */}
      {showReturnRequestConfirm && actionOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-dgreen">Request Return/Refund</h3>
              <button 
                onClick={() => setShowReturnRequestConfirm(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to request a return/refund for order #{actionOrder.order_number}? Your request will be reviewed by our team.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReturnRequestConfirm(false)}
                className="px-4 py-2 border border-lgreen text-gray-700 rounded-lg hover:border-dgreen cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer"
              >
                Yes, Request Return/Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && actionOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-dgreen">Rate Your Order</h3>
              <button 
                onClick={() => setShowRatingModal(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">How would you rate the product quality?</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </button>
        ))}
      </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-600 mb-2">Comments (optional)</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-dgreen resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPurchase;