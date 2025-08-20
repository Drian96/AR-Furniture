// ============================================================================
// AUTHENTICATION CONTEXT
// Manages user authentication state throughout the React application
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  AuthResponse, 
  RegisterRequest, 
  LoginRequest, 
  ProfileUpdateRequest,
  ChangePasswordRequest,
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  getProfile,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  verifyToken,
  isAuthenticated,
  removeToken
} from '../services/api';

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

// Authentication context interface
interface AuthContextType {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Authentication functions
  register: (userData: RegisterRequest) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  
  // Profile functions
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<void>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<void>;
  
  // Utility functions
  clearUser: () => void;
}

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

// Create the authentication context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTHENTICATION PROVIDER COMPONENT
// ============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // INITIALIZATION EFFECT
  // Check for existing token and validate it on app startup
  // ============================================================================
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        
        // Check if user has a stored token
        if (isAuthenticated()) {
          console.log('🔑 Found stored token, verifying...');
          
          // Verify the token with the backend
          const userData = await verifyToken();
          setUser(userData);
          console.log('✅ Token verified, user authenticated:', userData.email, 'role:', userData.role);
        } else {
          console.log('❌ No stored token found');
        }
      } catch (error) {
        console.error('❌ Authentication initialization failed:', error);
        // Clear any invalid tokens
        removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  /**
   * Register a new user account
   * @param userData - User registration data
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('📝 Registering new user:', userData.email);
      
      const response: AuthResponse = await apiRegister(userData);
      setUser(response.user);
      
      console.log('✅ Registration successful:', response.user.email);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user with email and password
   * @param credentials - Login credentials
   */
  const login = async (credentials: LoginRequest): Promise<User> => {
    try {
      setIsLoading(true);
      console.log('🔐 Logging in user:', credentials.email);
      
      const response: AuthResponse = await apiLogin(credentials);
      setUser(response.user);
      
      console.log('✅ Login successful:', response.user.email);
      return response.user;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear authentication state
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🚪 Logging out user...');
      
      await apiLogout();
      setUser(null);
      
      console.log('✅ Logout successful');
      
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Even if API call fails, clear local state
      setUser(null);
      // Still redirect to home page
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user's profile information
   * @param profileData - Profile data to update
   */
  const updateProfile = async (profileData: ProfileUpdateRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('📝 Updating user profile...');
      
      const updatedUser = await apiUpdateProfile(profileData);
      setUser(updatedUser);
      
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change user's password
   * @param passwordData - Password change data
   */
  const changePassword = async (passwordData: ChangePasswordRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔒 Changing password...');
      
      await apiChangePassword(passwordData);
      
      console.log('✅ Password changed successfully');
    } catch (error) {
      console.error('❌ Password change failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear user data (for manual logout or error handling)
   */
  const clearUser = (): void => {
    console.log('🧹 Clearing user data...');
    setUser(null);
    removeToken();
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    
    // Functions
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearUser,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// Hook to use the authentication context
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ============================================================================
// EXPORT
// ============================================================================

export default AuthContext; 