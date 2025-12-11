// ============================================================================
// API SERVICE FOR FRONTEND
// This file handles all communication with the backend API
// ============================================================================

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ============================================================================
// TYPES AND INTERFACES
// TypeScript interfaces for type safety
// ============================================================================

// User interface matching our backend User model
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  role: 'customer' | 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  avatarUrl?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Registration request interface
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// Profile update request interface
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

// Password change request interface
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// =========================
// Admin User management types
// =========================
export interface AdminListUsersResponse {
  users: Array<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'admin' | 'manager' | 'staff' | 'customer';
    status: 'active' | 'inactive';
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface AdminCreateUserRequest {
  fullName: string;
  email: string;
  contact?: string;
  role: 'admin' | 'manager' | 'staff';
  password: string;
}

export interface AdminUpdateUserRequest {
  fullName?: string;
  email?: string;
  contact?: string;
  role?: 'admin' | 'manager' | 'staff';
  status?: 'active' | 'inactive';
}

// Auth response interface
export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// Helper functions for API communication
// ============================================================================

/**
 * Get the stored JWT token from localStorage
 * @returns The JWT token or null if not found
 */
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Store JWT token in localStorage
 * @param token - The JWT token to store
 */
export const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated (has valid token)
 * @returns True if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Get authorization header for API requests
 * @returns Authorization header object
 */
const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Make HTTP request to API
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Promise with API response
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`📡 API Response:`, data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// ============================================================================
// AUTHENTICATION API FUNCTIONS
// Functions for user authentication and management
// ============================================================================

/**
 * Register a new user account
 * @param userData - User registration data
 * @returns Promise with user data and token
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (response.success && response.data) {
    // Store the token automatically
    setToken(response.data.token);
    return response.data;
  }

  throw new Error(response.message || 'Registration failed');
};

/**
 * Login user with email and password
 * @param credentials - Login credentials
 * @returns Promise with user data and token
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.success && response.data) {
    // Store the token automatically
    setToken(response.data.token);
    return response.data;
  }

  throw new Error(response.message || 'Login failed');
};

/**
 * Get current user's profile
 * @returns Promise with user profile data
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiRequest<{ user: User }>('/auth/profile');
  
  if (response.success && response.data && (response.data as any).user) {
    return (response.data as any).user;
  }

  throw new Error(response.message || 'Failed to get profile');
};

/**
 * Update user's profile information
 * @param profileData - Profile data to update
 * @returns Promise with updated user data
 */
export const updateProfile = async (profileData: ProfileUpdateRequest): Promise<User> => {
  const response = await apiRequest<{ user: User }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });

  if (response.success && response.data && (response.data as any).user) {
    return (response.data as any).user;
  }

  throw new Error(response.message || 'Failed to update profile');
};

/**
 * Change user's password
 * @param passwordData - Password change data
 * @returns Promise with success message
 */
export const changePassword = async (passwordData: ChangePasswordRequest): Promise<string> => {
  const response = await apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(passwordData),
  });

  if (response.success) {
    return response.message;
  }

  throw new Error(response.message || 'Failed to change password');
};

/**
 * Logout user (removes token from localStorage)
 * @returns Promise with success message
 */
export const logout = async (): Promise<string> => {
  try {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    });

    // Always remove token, even if API call fails
    removeToken();
    
    if (response.success) {
      return response.message;
    }
  } catch (error) {
    // Remove token even if API call fails
    removeToken();
  }

  return 'Logout successful';
};

/**
 * Verify if current token is valid
 * @returns Promise with user data if token is valid
 */
export const verifyToken = async (): Promise<User> => {
  const response = await apiRequest<{ user: User }>('/auth/verify');
  
  if (response.success && response.data && (response.data as any).user) {
    return (response.data as any).user;
  }

  // If token is invalid, remove it
  removeToken();
  throw new Error('Invalid or expired token');
};

/**
 * Send a verification code to the user's email
 * @param email - The email address to send the code to
 * @returns Promise with API response
 */
export const sendVerificationCode = async (email: string): Promise<ApiResponse> => {
  return await apiRequest<ApiResponse>('/auth/send-verification-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Verify a code sent to the user's email
 * @param email - The email address
 * @param code - The verification code
 * @returns Promise with API response
 */
export const verifyCode = async (email: string, code: string): Promise<ApiResponse> => {
  return await apiRequest<ApiResponse>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
};

/**
 * Reset a user's password using email + verification code
 * @param email - The user's email
 * @param code - The verification code
 * @param newPassword - The new password to set
 */
export const resetPassword = async (email: string, code: string, newPassword: string): Promise<ApiResponse> => {
  return await apiRequest<ApiResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword })
  });
};

/**
 * Handle OAuth callback - creates user if doesn't exist, prevents sign-in if email exists
 * @param email - User's email from OAuth provider
 * @param firstName - User's first name (optional)
 * @param lastName - User's last name (optional)
 * @param provider - OAuth provider name (optional)
 * @returns Promise with user data and token
 */
export const oauthCallback = async (
  email: string,
  firstName?: string,
  lastName?: string,
  provider?: string
): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/oauth/callback', {
    method: 'POST',
    body: JSON.stringify({ email, firstName, lastName, provider }),
  });

  if (response.success && response.data) {
    // Store the token automatically
    setToken(response.data.token);
    return response.data;
  }

  throw new Error(response.message || 'OAuth authentication failed');
};

// ============================================================================
// HEALTH CHECK
// Function to check if API is running
// ============================================================================

/**
 * Check if the API server is running
 * @returns Promise with health status
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('❌ API Health Check Failed:', error);
    return false;
  }
};

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  // Authentication
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken,
  sendVerificationCode,
  verifyCode,
  resetPassword,
  oauthCallback,
  
  // Token management
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  
  // Health check
  checkApiHealth,
}; 

// =========================
// Admin Analytics & Audit API
// =========================
export interface AdminDashboardResponse {
  stats: {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    productsInStock: number;
  };
  recentOrders: Array<{ id: string; customer: string; amount: number; status: string }>;
  topProducts: Array<{ name: string; price: number; sales: number }>;
  salesSeries: Array<{ month: string; sales: number }>;
}

export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const response = await apiRequest<AdminDashboardResponse>('/admin/dashboard');
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to load dashboard');
};

export interface AdminReportsResponse {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number | null;
  targetAchievement: number | null;
  avgOrderSize: number | null;
  category: Array<{ category: string; percentage: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: string }>;
  revenueTrend: Array<{ period: string; revenue: number }>;
}

export const getAdminReports = async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AdminReportsResponse> => {
  const response = await apiRequest<AdminReportsResponse>(`/admin/reports?period=${period}`);
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to load reports');
};

// =========================
// Product management types and functions
// =========================
export interface Product {
  id: number;
  name: string;
  code?: string;
  category: string;
  supplier: string;
  price: number;
  quantity: number;
  min_stock: number;
  description?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  created_at: string;
  updated_at: string;
}

export interface NewProductData {
  name: string;
  code?: string;
  category: string;
  supplier: string;
  price: number;
  quantity: number;
  min_stock?: number;
  description?: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiRequest<Product[]>('/products');
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to load products');
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await apiRequest<Product>(`/products/${id}`);
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to load product');
};

export const createProduct = async (productData: NewProductData): Promise<Product> => {
  const response = await apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to create product');
};

export const updateProduct = async (id: number, productData: NewProductData): Promise<Product> => {
  const response = await apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to update product');
};

export const deleteProduct = async (id: number): Promise<void> => {
  const response = await apiRequest(`/products/${id}`, {
    method: 'DELETE'
  });
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete product');
  }
};

export const updateProductStock = async (id: number, quantity: number): Promise<Product> => {
  const response = await apiRequest<Product>(`/products/${id}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to update stock');
};

// =========================
// Customer order statistics types and functions
// =========================
export interface CustomerOrderStats {
  customer: {
    id: number;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    totalAmount: number;
    status: string;
    itemCount: number;
    createdAt: string;
  }>;
}

export const getCustomerOrders = async (customerId: number): Promise<CustomerOrderStats> => {
  const response = await apiRequest<CustomerOrderStats>(`/admin/customer/${customerId}/orders`);
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to load customer orders');
};

// =========================
// Order management types and functions
// =========================
export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  user_id: number;
  items: OrderItem[];
  total_amount: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes?: string;
  payment_method?: string;
}

export interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product_name: string;
    product_category: string;
  }>;
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  const response = await apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to create order');
};

export const getUserOrders = async (userId: number): Promise<Order[]> => {
  const response = await apiRequest<Order[]>(`/orders/user/${userId}`);
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to load user orders');
};

export const getOrderById = async (orderId: number): Promise<OrderWithItems> => {
  const response = await apiRequest<OrderWithItems>(`/orders/${orderId}`);
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to load order');
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  const response = await apiRequest<Order>(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to update order status');
};

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: any;
}

export const getAuditLogs = async (params: { q?: string; category?: string; period?: 'day' | 'week' | 'month' | 'year' } = {}): Promise<AuditLogItem[]> => {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.category) query.set('category', params.category);
  if (params.period) query.set('period', params.period);
  const qs = query.toString();
  const response = await apiRequest<AuditLogItem[]>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
  if (response.success && response.data) return response.data as unknown as AuditLogItem[];
  throw new Error(response.message || 'Failed to load audit logs');
};

// =========================
// Admin Users API
// =========================
export const adminListUsers = async (): Promise<AdminListUsersResponse> => {
  const response = await apiRequest<AdminListUsersResponse>('/users');
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to list users');
};

export const adminCreateUser = async (payload: AdminCreateUserRequest) => {
  const response = await apiRequest<{ user: any }>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to create user');
};

export const adminUpdateUser = async (id: number, payload: AdminUpdateUserRequest) => {
  const response = await apiRequest<{ user: any }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (response.success && response.data) return response.data;
  throw new Error(response.message || 'Failed to update user');
};

export const adminDeleteUser = async (id: number) => {
  const response = await apiRequest(`/users/${id}`, { method: 'DELETE' });
  if (response.success) return true;
  throw new Error(response.message || 'Failed to delete user');
};

// =========================
// Address management types
// =========================
export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  phone?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  postal_code?: string;
  street_address?: string;
  address_type: 'home' | 'work' | 'other';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  recipient_name: string;
  phone?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  postal_code?: string;
  street_address?: string;
  address_type?: 'home' | 'work' | 'other';
}

export interface UpdateAddressRequest extends CreateAddressRequest {}

export interface AddressListResponse {
  success: boolean;
  addresses: Address[];
}

// =========================
// Address API functions
// =========================
export const getUserAddresses = async (): Promise<Address[]> => {
  const response = await apiRequest<AddressListResponse>('/addresses');
  if (response.success && response.data) return response.data.addresses;
  throw new Error(response.message || 'Failed to fetch addresses');
};

export const createAddress = async (payload: CreateAddressRequest): Promise<Address> => {
  const response = await apiRequest<{ address: Address }>('/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (response.success && response.data) return response.data.address;
  throw new Error(response.message || 'Failed to create address');
};

export const updateAddress = async (id: number, payload: UpdateAddressRequest): Promise<Address> => {
  const response = await apiRequest<{ address: Address }>(`/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (response.success && response.data) return response.data.address;
  throw new Error(response.message || 'Failed to update address');
};

export const deleteAddress = async (id: number): Promise<boolean> => {
  const response = await apiRequest(`/addresses/${id}`, { method: 'DELETE' });
  if (response.success) return true;
  throw new Error(response.message || 'Failed to delete address');
};

export const setDefaultAddress = async (id: number): Promise<Address> => {
  const response = await apiRequest<{ address: Address }>(`/addresses/${id}/default`, {
    method: 'PUT',
  });
  if (response.success && response.data) return response.data.address;
  throw new Error(response.message || 'Failed to set default address');
};

// Get addresses for a specific user (admin function)
export const getAddressesByUserId = async (userId: number): Promise<Address[]> => {
  const response = await apiRequest<AddressListResponse>(`/addresses/user/${userId}`);
  if (response.success && response.data) return response.data.addresses;
  throw new Error(response.message || 'Failed to fetch user addresses');
};