// =============================
// Supabase Services Index
// Central export point for all Supabase services
// =============================

// Client and utilities
export { supabase, PRODUCT_IMAGES_BUCKET, ensureStorageAuth } from './client';

// Authentication
export {
  signInWithOAuth,
  signInWithGoogle,
  signInWithFacebook,
  handleOAuthCallback,
  getCurrentUser,
  signOut,
  onAuthStateChange,
} from './auth';

// Services
export { productService } from './products';
export { cartService } from './cart';
export { orderService } from './orders';
export { reviewService } from './reviews';
export { notificationService } from './notifications';

// Types
export type {
  Product,
  ProductImage,
  NewProductData,
  Cart,
  CartItemRow,
  Order,
  OrderItem,
  ProductReview,
  ProductReviewStats,
  CreateOrderData,
  Notification,
} from './types';

