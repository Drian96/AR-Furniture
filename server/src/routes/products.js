const express = require('express');
const router = express.Router();

// Import product controller
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');

// Import authentication middleware
const { authenticateToken, requireStaff } = require('../middleware/auth');

// ============================================================================
// PRODUCT ROUTES
// These routes handle product and inventory management
// ============================================================================

/**
 * GET /api/products
 * Get all products with inventory information
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: 1,
 *       name: "Product Name",
 *       code: "PROD001",
 *       category: "Seating",
 *       supplier: "Supplier Name",
 *       price: 1000.00,
 *       quantity: 50,
 *       min_stock: 10,
 *       description: "Product description",
 *       status: "In Stock",
 *       created_at: "2024-01-01T00:00:00Z",
 *       updated_at: "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 */
router.get('/', getProducts);

/**
 * GET /api/products/:id
 * Get single product by ID
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: 1,
 *     name: "Product Name",
 *     code: "PROD001",
 *     category: "Seating",
 *     supplier: "Supplier Name",
 *     price: 1000.00,
 *     quantity: 50,
 *     min_stock: 10,
 *     description: "Product description",
 *     status: "In Stock",
 *     created_at: "2024-01-01T00:00:00Z",
 *     updated_at: "2024-01-01T00:00:00Z"
 *   }
 * }
 */
router.get('/:id', getProductById);

/**
 * POST /api/products
 * Create new product (Admin/Staff only)
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Request Body:
 * {
 *   name: "Product Name",
 *   code: "PROD001",
 *   category: "Seating",
 *   supplier: "Supplier Name",
 *   price: 1000.00,
 *   quantity: 50,
 *   min_stock: 10,
 *   description: "Product description"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Product created successfully",
 *   data: { ... }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 * - requireStaff: Ensures only staff can create products
 */
router.post('/', authenticateToken, requireStaff, createProduct);

/**
 * PUT /api/products/:id
 * Update product (Admin/Staff only)
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Request Body:
 * {
 *   name: "Updated Product Name",
 *   code: "PROD001",
 *   category: "Seating",
 *   supplier: "Supplier Name",
 *   price: 1200.00,
 *   quantity: 45,
 *   min_stock: 10,
 *   description: "Updated description"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Product updated successfully",
 *   data: { ... }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 * - requireStaff: Ensures only staff can update products
 */
router.put('/:id', authenticateToken, requireStaff, updateProduct);

/**
 * DELETE /api/products/:id
 * Delete product (Admin/Staff only)
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Product deleted successfully"
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 * - requireStaff: Ensures only staff can delete products
 */
router.delete('/:id', authenticateToken, requireStaff, deleteProduct);

/**
 * PUT /api/products/:id/stock
 * Update product stock (Admin/Staff only)
 * Used internally when orders are placed
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Request Body:
 * {
 *   quantity: 45
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Stock updated successfully",
 *   data: { ... }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token
 * - requireStaff: Ensures only staff can update stock
 */
router.put('/:id/stock', authenticateToken, requireStaff, updateStock);

module.exports = router;
