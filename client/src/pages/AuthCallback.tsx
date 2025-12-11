// =============================
// OAuth Callback Page
// Handles OAuth redirects from Google/Facebook
// =============================

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '../services/supabase/auth';
import { oauthCallback as apiOAuthCallback } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { signOut as supabaseSignOut } from '../services/supabase/auth';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const hasProcessedRef = useRef(false);
  const sessionDataRef = useRef<{ email: string; firstName: string; lastName: string; provider: string } | null>(null);

  useEffect(() => {
    // Prevent multiple executions using ref
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processCallback = async () => {
      try {
        // Use stored session data if available (from previous execution)
        let user;
        if (sessionDataRef.current) {
          // Use stored data
          user = {
            email: sessionDataRef.current.email,
            user_metadata: {
              first_name: sessionDataRef.current.firstName,
              last_name: sessionDataRef.current.lastName,
            },
            app_metadata: {
              provider: sessionDataRef.current.provider,
            },
          };
        } else {
          // Handle the OAuth callback and get the session from Supabase
          const result = await handleOAuthCallback();
          
          if (!result || !result.session) {
            throw new Error('No session found. Please try signing in again.');
          }

          user = result.session.user;
          
          // Store session data for potential re-use
          const email = user.email;
          const firstName = user.user_metadata?.full_name?.split(' ')[0] || 
                           user.user_metadata?.first_name || 
                           user.user_metadata?.name?.split(' ')[0] || 
                           '';
          const lastName = user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                         user.user_metadata?.last_name || 
                         user.user_metadata?.name?.split(' ').slice(1).join(' ') || 
                         '';
          const provider = user.app_metadata?.provider || 'google';
          
          sessionDataRef.current = { email, firstName, lastName, provider };
        }
        
        // Use stored session data or extract from user object
        const email = sessionDataRef.current?.email || user.email;
        const firstName = sessionDataRef.current?.firstName || '';
        const lastName = sessionDataRef.current?.lastName || '';
        const provider = sessionDataRef.current?.provider || 'google';
        
        if (!email) {
          throw new Error('Email not provided by OAuth provider');
        }

        // Call backend OAuth endpoint
        // This will create user if doesn't exist, or reject if email already exists
        try {
          const authResponse = await apiOAuthCallback(email, firstName, lastName, provider);
          
          // Refresh AuthContext to update user state
          // The token is already stored by oauthCallback
          await refreshAuth();
          
          setStatus('success');
          
          // Store role for navigation
          sessionStorage.setItem('lastLoginRole', authResponse.user.role);
          
          // Redirect based on user role
          const role = authResponse.user.role;
          setTimeout(() => {
            if (role === 'admin' || role === 'manager' || role === 'staff') {
              navigate('/admin');
            } else {
              navigate('/products');
            }
          }, 1500);
        } catch (apiError: any) {
          console.error('Backend OAuth error:', apiError);
          
          // If email already exists, sign out from Supabase and show error
          if (apiError.message?.includes('already exists') || apiError.message?.includes('EMAIL_EXISTS')) {
            await supabaseSignOut();
            setError('An account with this email already exists. Please sign in with your password instead.');
            setStatus('error');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
            return;
          }
          
          // Other errors
          await supabaseSignOut();
          setError(apiError.message || 'Failed to complete authentication');
          setStatus('error');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        setStatus('error');
        
        // Sign out from Supabase on error
        try {
          await supabaseSignOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-dgreen mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-4">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful!</h2>
        <p className="text-gray-600 mb-6">Redirecting to your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

