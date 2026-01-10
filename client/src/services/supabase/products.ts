// =============================
// Product Service
// Handles all product-related operations
// =============================

import { supabase, PRODUCT_IMAGES_BUCKET, ensureStorageAuth } from './client';
import type { Product, ProductImage, NewProductData } from './types';

// Helper function to get correct MIME type for file
const getFileMimeType = (file: File): string => {
  const fileName = file.name.toLowerCase();
  
  // If browser already detected a valid MIME type, use it (for images)
  if (file.type && file.type !== 'application/octet-stream') {
    return file.type;
  }
  
  // Map file extensions to correct MIME types
  if (fileName.endsWith('.glb')) {
    return 'model/gltf-binary';
  }
  if (fileName.endsWith('.gltf')) {
    return 'model/gltf+json';
  }
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (fileName.endsWith('.png')) {
    return 'image/png';
  }
  if (fileName.endsWith('.webp')) {
    return 'image/webp';
  }
  
  // Fallback to file.type if available, otherwise undefined
  return file.type || 'application/octet-stream';
};

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
          
          // Upload file to Supabase Storage with correct MIME type
          const contentType = getFileMimeType(file);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .upload(filePath, file, { upsert: false, contentType });

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

      // Upload file with correct MIME type
      const contentType = getFileMimeType(file);
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(filePath, file, { upsert: false, contentType });
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
  },

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

