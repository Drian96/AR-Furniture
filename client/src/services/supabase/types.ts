// =============================
// Shared Types for Supabase Services
// =============================

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
  product_id: string;
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
    product_id: string;
    quantity: number;
    price: number;
  }[];
}

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

