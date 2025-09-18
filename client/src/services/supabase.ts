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
