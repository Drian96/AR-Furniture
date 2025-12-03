import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Centralize bucket name here so it's consistent across the app
export const PRODUCT_IMAGES_BUCKET = 'product-images';

// Ensure we have a Supabase Auth session in the browser for Storage RLS
// For Option B: sign in a dedicated storage user configured via env vars.
export async function ensureStorageAuth(): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (data?.user) return;

  const email = import.meta.env.VITE_SUPABASE_STORAGE_EMAIL;
  const password = import.meta.env.VITE_SUPABASE_STORAGE_PASSWORD;
  // If no credentials are provided, treat as no-op. This supports public INSERT storage policy.
  if (!email || !password) return;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Supabase sign-in failed: ${error.message}`);
}

// Types for our database tables
export interface Product {
  id: string;
  name: string;
  code: string | null;
  category: string;
  supplier: string;
  description: string | null;
  price: number;
  quantity: number;
  min_stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface NewProductData {
  name: string;
  code?: string;
  category: string;
  supplier: string;
  description?: string;
  price: number;
  quantity: number;
  min_stock: number;
}

// Product service functions
export const productService = {
  // Create a new product with images
  async createProduct(productData: NewProductData, imageFiles: File[]): Promise<{ product: Product; images: ProductImage[] }> {
    try {
      // First, create the product in the database
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) {
        throw new Error(`Failed to create product: ${productError.message}`);
      }

      // Ensure we are authenticated for Storage uploads (RLS)
      if (imageFiles.length > 0) {
        await ensureStorageAuth();
      }

      // Upload images to Supabase Storage and create image records
      const images: ProductImage[] = [];
      
      if (imageFiles.length > 0) {
        // Create folder path for this product's images
        const productFolder = `products/${product.id}`;
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileName = `${Date.now()}-${i}-${file.name}`;
          const filePath = `${productFolder}/${fileName}`;
          
          // Upload file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .upload(filePath, file, { upsert: false, contentType: file.type || undefined });

          if (uploadError) {
            console.error(`Failed to upload image ${fileName}:`, uploadError);
            // Surface error to the caller so they know why images are missing
            throw new Error(`Storage upload failed: ${uploadError.message}`);
          }

          // Get public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .getPublicUrl(filePath);

          // Create image record in database
          const { data: imageRecord, error: imageError } = await supabase
            .from('product_images')
            .insert([{
              product_id: product.id,
              image_url: publicUrl,
              storage_path: filePath,
              is_primary: i === 0, // First image is primary
              sort_order: i
            }])
            .select()
            .single();

          if (imageError) {
            console.error(`Failed to create image record for ${fileName}:`, imageError);
            // If DB insert fails, attempt to remove the uploaded storage object to avoid orphaned files
            await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([filePath]);
            throw new Error(`DB insert failed for image: ${imageError.message}`);
          }

          images.push(imageRecord);
        }
      }

      return { product, images };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Upload additional images for an existing product
  async uploadProductImages(productId: string, imageFiles: File[], startOrder: number = 0): Promise<ProductImage[]> {
    if (imageFiles.length === 0) return [];
    await ensureStorageAuth();

    const images: ProductImage[] = [];
    const productFolder = `products/${productId}`;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileName = `${Date.now()}-${i}-${file.name}`;
      const filePath = `${productFolder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(filePath, file, { upsert: false, contentType: file.type || undefined });
      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(filePath);

      const { data: imageRecord, error: imageError } = await supabase
        .from('product_images')
        .insert([{
          product_id: productId,
          image_url: publicUrl,
          storage_path: filePath,
          is_primary: startOrder + i === 0,
          sort_order: startOrder + i
        }])
        .select()
        .single();

      if (imageError) {
        await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([filePath]);
        throw new Error(`DB insert failed for image: ${imageError.message}`);
      }
      images.push(imageRecord);
    }
    return images;
  },

  // Get all products with their images
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by id
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        if ((error as any).code === 'PGRST116') return null; // not found
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get product images by product ID
  async getProductImages(productId: string): Promise<ProductImage[]> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch product images: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching product images:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<NewProductData>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (this will also delete associated images due to CASCADE)
  async deleteProduct(productId: string): Promise<void> {
    try {
      await ensureStorageAuth();
      // First, get the product's images to delete from storage
      const images = await this.getProductImages(productId);
      
      // Delete images from storage
      for (const image of images) {
        if (image.storage_path) {
          await supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .remove([image.storage_path]);
        }
      }

      // Delete product from database (images will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
  ,

  // Delete a single product image (storage + DB)
  async deleteProductImage(image: ProductImage): Promise<void> {
    try {
      await ensureStorageAuth();
      if (image.storage_path) {
        await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .remove([image.storage_path]);
      }
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', image.id);
      if (error) throw new Error(`Failed to delete image row: ${error.message}`);
    } catch (error) {
      console.error('Error deleting product image:', error);
      throw error;
    }
  }
};

// =============================
// Cart types and service
// =============================
export interface Cart {
  id: string;
  user_id: string;
  status: 'active' | 'converted' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface CartItemRow {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export const cartService = {
  async getOrCreateActiveCart(userId: number): Promise<Cart> {
    console.log('🛒 Getting/creating cart for user:', userId);
    
    // First try to get existing active cart
    const { data: existing, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existing && !fetchError) {
      console.log('✅ Found existing cart:', existing.id);
      return existing as Cart;
    }

    console.log('📝 No existing cart found, creating new one...');
    
    // If no existing cart, create new one
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert([{ user_id: userId, status: 'active' }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create cart:', createError);
      throw new Error(`Failed to create cart: ${createError.message}`);
    }
    
    console.log('✅ Created new cart:', newCart.id);
    return newCart as Cart;
  },

  async getItems(cartId: string): Promise<CartItemRow[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch cart items: ${error.message}`);
    return data || [];
  },

  async upsertItem(cartId: string, productId: string, quantityDelta: number, unitPrice: number): Promise<void> {
    console.log('🛒 Upserting cart item:', { cartId, productId, quantityDelta, unitPrice });
    
    // Try to fetch existing item
    const { data: existing, error: selectErr } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (!selectErr && existing) {
      console.log('📝 Updating existing item:', existing.id);
      const newQty = Math.max(1, (existing.quantity || 0) + quantityDelta);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty, unit_price: unitPrice })
        .eq('id', existing.id);
      if (error) {
        console.error('❌ Failed to update cart item:', error);
        throw new Error(`Failed to update cart item: ${error.message}`);
      }
      console.log('✅ Updated cart item successfully');
      return;
    }

    console.log('📝 Creating new cart item...');
    // If not found, insert
    const { error: insertErr } = await supabase
      .from('cart_items')
      .insert([{ cart_id: cartId, product_id: productId, quantity: Math.max(1, quantityDelta), unit_price: unitPrice }]);
    if (insertErr) {
      console.error('❌ Failed to add cart item:', insertErr);
      throw new Error(`Failed to add cart item: ${insertErr.message}`);
    }
    console.log('✅ Added cart item successfully');
  },

  async setQuantity(cartId: string, productId: string, quantity: number, unitPrice?: number): Promise<void> {
    if (quantity <= 0) return this.removeItem(cartId, productId);
    const patch: any = { quantity };
    if (typeof unitPrice === 'number') patch.unit_price = unitPrice;
    const { error } = await supabase
      .from('cart_items')
      .update(patch)
      .eq('cart_id', cartId)
      .eq('product_id', productId);
    if (error) throw new Error(`Failed to set quantity: ${error.message}`);
  },

  async removeItem(cartId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId);
    if (error) throw new Error(`Failed to remove item: ${error.message}`);
  },

  async clear(cartId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);
    if (error) throw new Error(`Failed to clear cart: ${error.message}`);
  }
};

// =============================
// Order types and service
// =============================
export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes?: string;
  payment_method: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'return_refund';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: string; // Changed to string (UUID)
  quantity: number;
  price: number;
  created_at: string;
}

export interface ProductReview {
  id: string;
  order_id: number;
  product_id: string;
  user_id: number;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ProductReviewStats {
  product_id: string;
  total_reviews: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

export interface CreateOrderData {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes?: string;
  payment_method: string;
  total_amount: number;
  items: {
    product_id: string; // Changed to string (UUID)
    quantity: number;
    price: number;
  }[];
}

export const orderService = {
  // Create a new order with items
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      console.log('📦 Creating order:', orderData);
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          first_name: orderData.first_name,
          last_name: orderData.last_name,
          email: orderData.email,
          phone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          postal_code: orderData.postal_code,
          notes: orderData.notes,
          payment_method: orderData.payment_method,
          total_amount: orderData.total_amount
        }])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Failed to create order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('✅ Order created:', order.id);

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Failed to create order items:', itemsError);
        // Try to clean up the order if items creation failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('✅ Order items created successfully');
      
      // Create a notification for the user about their new order
      try {
        await notificationService.createNotification({
          user_id: orderData.user_id,
          title: 'Order Confirmed',
          message: `Your order #${order.order_number} has been confirmed. Total: ₱${orderData.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          type: 'order',
          link: `/orders/${order.id}`,
          metadata: { order_id: order.id, order_number: order.order_number },
        });
      } catch (notifError) {
        // Don't fail the order creation if notification fails
        console.warn('⚠️ Failed to create order notification:', notifError);
      }
      
      return order as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get orders for a user
  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get order with items
  async getOrderWithItems(orderId: number): Promise<{ order: Order; items: OrderItem[] }> {
    try {
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw new Error(`Failed to fetch order: ${orderError.message}`);
      }

      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`);
      }

      return {
        order: order as Order,
        items: items || []
      };
    } catch (error) {
      console.error('Error fetching order with items:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: number, status: Order['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get all orders (for admin)
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Get order with items and product details (for admin)
  async getOrderWithDetails(orderId: number): Promise<{
    order: Order;
    items: (OrderItem & { product_name: string; product_image?: string })[];
  }> {
    try {
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw new Error(`Failed to fetch order: ${orderError.message}`);
      }

      // Get order items with product details
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products!inner(name)
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`);
      }

      // Get product images for each product
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const product = item.products as any;
          
          // Get primary image for this product
          const { data: productImages } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', item.product_id)
            .eq('is_primary', true)
            .single();
          
          return {
            ...item,
            product_name: product?.name || 'Unknown Product',
            product_image: productImages?.image_url || null
          };
        })
      );

      return {
        order: order as Order,
        items: itemsWithDetails
      };
    } catch (error) {
      console.error('Error fetching order with details:', error);
      throw error;
    }
  }
};

// Review service for handling product reviews and ratings
export const reviewService = {
  // Create a new product review
  async createReview(reviewData: {
    order_id: number;
    product_id: string;
    user_id: number;
    rating: number;
    comment?: string;
  }): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert([{ ...reviewData, status: 'pending' }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get reviews for a specific product
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          users!inner(first_name, last_name)
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch product reviews: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Get review statistics for a product
  async getProductReviewStats(productId: string): Promise<ProductReviewStats | null> {
    try {
      const { data, error } = await supabase
        .from('product_review_stats')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No reviews found
          return null;
        }
        throw new Error(`Failed to fetch review stats: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  },

  // Check if user has already reviewed a product from a specific order
  async hasUserReviewedProduct(orderId: number, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('order_id', orderId)
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No review found
          return false;
        }
        throw new Error(`Failed to check review: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('Error checking review:', error);
      return false;
    }
  },

  // Update an existing review
  async updateReview(reviewId: string, updates: {
    rating?: number;
    comment?: string;
  }): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        throw new Error(`Failed to delete review: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get all reviews for admin (with user and product info)
  async getAllReviews(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          users!inner(first_name, last_name),
          products!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch all reviews: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  },

  // Approve a review
  async approveReview(reviewId: string): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to approve review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  },

  // Reject a review
  async rejectReview(reviewId: string): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reject review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  }
};

// Notification types and service
export interface Notification {
  id: string;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promotion';
  read: boolean;
  link: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const notificationService = {
  /**
   * Get all notifications for the current user
   * Returns notifications ordered by most recent first
   */
  async getNotifications(userId: number): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count for the current user
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0; // Return 0 on error to not break the UI
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Create a new notification (typically called by backend/system)
   * Note: In production, this should be called with service role, not from client
   */
  async createNotification(notification: {
    user_id: number;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promotion';
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          link: notification.link || null,
          metadata: notification.metadata || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};