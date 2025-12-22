import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Extend Window interface to include Tawk_API
declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

/**
 * TawkToManager Component
 * Manages Tawk.to chat widget visibility and user information
 * 
 * Rules:
 * - Hide widget on: Home (/), Login (/login), and all admin routes (/admin, /AdminProfile, /admin/system-settings)
 * - Show widget only for logged-in customers (role === 'customer')
 * - Set user's first name, last name, and email when visible
 */
const TawkToManager = () => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    // Function to manage Tawk.to widget visibility and user info
    const manageTawkWidget = () => {
      // Check if Tawk.to API is available
      if (typeof window.Tawk_API === 'undefined') {
        return false;
      }

      // Check if the widget methods are available
      if (typeof window.Tawk_API.hideWidget !== 'function' || 
          typeof window.Tawk_API.showWidget !== 'function') {
        // Widget not fully initialized yet
        return false;
      }

      // Routes where widget should be hidden
      const hiddenRoutes = ['/', '/login', '/admin', '/AdminProfile', '/admin/system-settings'];
      const isHiddenRoute = hiddenRoutes.some(route => 
        location.pathname === route || location.pathname.startsWith('/admin')
      );

      // Show widget only if:
      // 1. User is authenticated
      // 2. User is a customer (not admin/manager/staff)
      // 3. Not on a hidden route
      const shouldShowWidget = 
        !isLoading && 
        isAuthenticated && 
        user?.role === 'customer' && 
        !isHiddenRoute;

      try {
        if (shouldShowWidget) {
          // Set user attributes (first name, last name, email)
          const fullName = `${user.firstName} ${user.lastName}`.trim();
          
          // Check if setAttributes exists before calling
          if (typeof window.Tawk_API.setAttributes === 'function') {
            window.Tawk_API.setAttributes({
              name: fullName,
              email: user.email,
              hash: '', // Optional: for additional security
            }, (error: any) => {
              if (error) {
                console.error('Error setting Tawk.to user attributes:', error);
              } else {
                console.log('Tawk.to user attributes set successfully:', {
                  name: fullName,
                  email: user.email,
                });
              }
            });
          }

          // Show the widget
          window.Tawk_API.showWidget();
        } else {
          // Hide the widget
          window.Tawk_API.hideWidget();
        }
        return true;
      } catch (error) {
        console.error('Error managing Tawk.to widget:', error);
        return false;
      }
    };

    // Set up Tawk.to onLoad callback BEFORE the script loads (if Tawk_API exists)
    // This ensures our callback is registered before Tawk.to initializes
    if (typeof window.Tawk_API !== 'undefined') {
      // Store original onLoad if it exists
      const originalOnLoad = window.Tawk_API.onLoad;
      
      // Set up our onLoad callback
      window.Tawk_API.onLoad = function() {
        // Call original callback if it exists
        if (typeof originalOnLoad === 'function') {
          originalOnLoad();
        }
        // Manage widget after load - give it a moment to fully initialize
        setTimeout(() => {
          manageTawkWidget();
        }, 300);
      };
      
      // Also try to manage immediately in case widget is already loaded
      setTimeout(() => {
        manageTawkWidget();
      }, 1000);
    } else {
      // Tawk_API doesn't exist yet, set it up so our callback is ready when script loads
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onLoad = function() {
        setTimeout(() => {
          manageTawkWidget();
        }, 300);
      };
    }

    // Wait for Tawk.to to be loaded and ready
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait time
    
    const checkTawkAndManage = () => {
      attempts++;
      
      if (typeof window.Tawk_API !== 'undefined') {
        const success = manageTawkWidget();
        
        // If widget methods aren't ready yet, keep trying
        if (!success && attempts < maxAttempts) {
          setTimeout(checkTawkAndManage, 100);
        }
      } else if (attempts < maxAttempts) {
        // Tawk.to script not loaded yet, keep checking
        setTimeout(checkTawkAndManage, 100);
      }
    };

    // Start checking
    checkTawkAndManage();
  }, [location.pathname, isAuthenticated, user, isLoading]);

  // This component doesn't render anything
  return null;
};

export default TawkToManager;

