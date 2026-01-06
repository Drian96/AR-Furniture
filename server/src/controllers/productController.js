const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

/**
 * Product Controller
 * Handles product and inventory management operations
 */

/**
 * Get all products with inventory information
 * GET /api/products
 */
exports.getProducts = async (req, res) => {
  try {
    console.log('🔄 Fetching products...');

    const products = await sequelize.query(
      `SELECT 
        id,
        name,
        code,
        category,
        supplier,
        price,
        quantity,
        min_stock,
        description,
        status,
        created_at,
        updated_at
      FROM public.products 
      ORDER BY created_at DESC`,
      { type: QueryTypes.SELECT }
    );

    // Calculate status based on quantity
    const productsWithStatus = products.map(product => ({
      ...product,
      status: product.quantity === 0 ? 'Out of Stock' : 
              product.quantity <= product.min_stock ? 'Low Stock' : 'In Stock'
    }));

    res.status(200).json({
      success: true,
      data: productsWithStatus
    });

    console.log(`✅ Retrieved ${productsWithStatus.length} products`);

  } catch (error) {
    console.error('❌ Get products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Fetching product ${id}...`);

    const [product] = await sequelize.query(
      `SELECT 
        id,
        name,
        code,
        category,
        supplier,
        price,
        quantity,
        min_stock,
        description,
        status,
        created_at,
        updated_at
      FROM public.products 
      WHERE id = :id`,
      { 
        type: QueryTypes.SELECT,
        replacements: { id }
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate status
    product.status = product.quantity === 0 ? 'Out of Stock' : 
                    product.quantity <= product.min_stock ? 'Low Stock' : 'In Stock';

    res.status(200).json({
      success: true,
      data: product
    });

    console.log(`✅ Retrieved product: ${product.name}`);

  } catch (error) {
    console.error('❌ Get product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * Create new product
 * POST /api/products
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      code,
      category,
      supplier,
      price,
      quantity,
      min_stock,
      description
    } = req.body;

    console.log('🔄 Creating new product...', { name, category, supplier, price, quantity });

    // Validate required fields
    if (!name || !category || !supplier || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, supplier, price, quantity'
      });
    }

    // Validate price and quantity are numbers
    if (isNaN(price) || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity must be valid numbers'
      });
    }

    const result = await sequelize.query(
      `INSERT INTO public.products 
       (name, code, category, supplier, price, quantity, min_stock, description, created_at, updated_at)
       VALUES (:name, :code, :category, :supplier, :price, :quantity, :min_stock, :description, NOW(), NOW())
       RETURNING *`,
      { 
        type: QueryTypes.SELECT,
        replacements: {
          name,
          code: code || null,
          category,
          supplier,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          min_stock: min_stock ? parseInt(min_stock) : 0,
          description: description || null
        }
      }
    );

    // Handle result - sequelize.query with RETURNING returns an array
    const newProduct = Array.isArray(result) && result.length > 0 ? result[0] : result;

    if (!newProduct) {
      throw new Error('Failed to retrieve created product');
    }

    // Calculate status
    newProduct.status = newProduct.quantity === 0 ? 'Out of Stock' : 
                       newProduct.quantity <= newProduct.min_stock ? 'Low Stock' : 'In Stock';

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });

    console.log(`✅ Created product: ${newProduct.name}`);

  } catch (error) {
    console.error('❌ Create product error:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      category,
      supplier,
      price,
      quantity,
      min_stock,
      description
    } = req.body;

    console.log(`🔄 Updating product ${id}...`);

    const [updatedProduct] = await sequelize.query(
      `UPDATE public.products 
       SET 
         name = :name,
         code = :code,
         category = :category,
         supplier = :supplier,
         price = :price,
         quantity = :quantity,
         min_stock = :min_stock,
         description = :description,
         updated_at = NOW()
       WHERE id = :id
       RETURNING *`,
      { 
        type: QueryTypes.SELECT,
        replacements: {
          id,
          name,
          code: code || null,
          category,
          supplier,
          price,
          quantity,
          min_stock: min_stock || 0,
          description: description || null
        }
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate status
    updatedProduct.status = updatedProduct.quantity === 0 ? 'Out of Stock' : 
                           updatedProduct.quantity <= updatedProduct.min_stock ? 'Low Stock' : 'In Stock';

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

    console.log(`✅ Updated product: ${updatedProduct.name}`);

  } catch (error) {
    console.error('❌ Update product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Deleting product ${id}...`);

    const result = await sequelize.query(
      `DELETE FROM public.products WHERE id = :id`,
      { 
        type: QueryTypes.DELETE,
        replacements: { id }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

    console.log(`✅ Deleted product ${id}`);

  } catch (error) {
    console.error('❌ Delete product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * Update product stock (used when orders are placed)
 * PUT /api/products/:id/stock
 */
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    console.log(`🔄 Updating stock for product ${id}...`);

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    const [updatedProduct] = await sequelize.query(
      `UPDATE public.products 
       SET quantity = :quantity, updated_at = NOW()
       WHERE id = :id
       RETURNING *`,
      { 
        type: QueryTypes.SELECT,
        replacements: { id, quantity }
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate status
    updatedProduct.status = updatedProduct.quantity === 0 ? 'Out of Stock' : 
                           updatedProduct.quantity <= updatedProduct.min_stock ? 'Low Stock' : 'In Stock';

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedProduct
    });

    console.log(`✅ Updated stock for product: ${updatedProduct.name}`);

  } catch (error) {
    console.error('❌ Update stock error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};
