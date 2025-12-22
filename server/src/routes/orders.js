const express = require('express');
const router = express.Router();

// Import order controller
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

// Import authentication middleware
const { authenticateToken } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');

// ============================================================================
// ORDER ROUTES
// These routes handle order creation and management
// ============================================================================

/**
 * POST /api/orders
 * Create new order and update product stock
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Request Body:
 * {
 *   user_id: 1,
 *   items: [
 *     {
 *       product_id: 1,
 *       quantity: 2,
 *       price: 1000.00
 *     }
 *   ],
 *   total_amount: 2000.00,
 *   shipping_address: "123 Main St, City, Country"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Order created successfully",
 *   data: {
 *     id: 1,
 *     order_number: "ORD-1234567890-ABC123",
 *     total_amount: 2000.00,
 *     status: "pending",
 *     created_at: "2024-01-01T00:00:00Z"
 *   }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 */
router.post('/', authenticateToken, auditLogger('Create Order', 'Orders', 'Order placed'), createOrder);

/**
 * GET /api/orders/user/:userId
 * Get orders for a specific user
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: 1,
 *       order_number: "ORD-1234567890-ABC123",
 *       total_amount: 2000.00,
 *       status: "pending",
 *       shipping_address: "123 Main St, City, Country",
 *       item_count: 2,
 *       created_at: "2024-01-01T00:00:00Z",
 *       updated_at: "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 */
router.get('/user/:userId', authenticateToken, getUserOrders);

/**
 * GET /api/orders/:id
 * Get single order with items
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: 1,
 *     order_number: "ORD-1234567890-ABC123",
 *     total_amount: 2000.00,
 *     status: "pending",
 *     shipping_address: "123 Main St, City, Country",
 *     created_at: "2024-01-01T00:00:00Z",
 *     updated_at: "2024-01-01T00:00:00Z",
 *     items: [
 *       {
 *         id: 1,
 *         product_id: 1,
 *         quantity: 2,
 *         price: 1000.00,
 *         product_name: "Product Name",
 *         product_category: "Seating"
 *       }
 *     ]
 *   }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 */
router.get('/:id', authenticateToken, getOrderById);

/**
 * PUT /api/orders/:id/status
 * Update order status
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Request Body:
 * {
 *   status: "processing"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Order status updated successfully",
 *   data: {
 *     id: 1,
 *     order_number: "ORD-1234567890-ABC123",
 *     total_amount: 2000.00,
 *     status: "processing",
 *     created_at: "2024-01-01T00:00:00Z",
 *     updated_at: "2024-01-01T00:00:00Z"
 *   }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 */
router.put('/:id/status', authenticateToken, auditLogger('Update Order Status', 'Orders', 'Order status changed'), updateOrderStatus);

module.exports = router;
