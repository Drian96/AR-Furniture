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
  
  // Token management
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  
  // Health check
  checkApiHealth,
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