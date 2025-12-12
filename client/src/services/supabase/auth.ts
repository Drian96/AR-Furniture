// =============================
// Supabase Authentication Service
// Handles OAuth authentication (Google, Facebook, etc.)
// =============================

import { supabase } from './client';

export type OAuthProvider = 'google' | 'facebook';

/**
 * Sign in with OAuth provider (Google or Facebook)
 * @param provider - The OAuth provider to use
 * @param redirectTo - Optional redirect URL after authentication
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo?: string
): Promise<void> {
  try {
    // Use provided redirect URL or construct from current origin
    // This works for both localhost and production automatically
    const redirectUrl = redirectTo || `${window.location.origin}/auth/callback`;
    
    console.log(`🔐 Initiating ${provider} OAuth with redirect: ${redirectUrl}`);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw new Error(`OAuth sign-in failed: ${error.message}`);
    }
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    throw error;
  }
}

/**
 * Sign in with Google OAuth
 * @param redirectTo - Optional redirect URL after authentication
 */
export async function signInWithGoogle(redirectTo?: string): Promise<void> {
  return signInWithOAuth('google', redirectTo);
}

/**
 * Sign in with Facebook OAuth
 * @param redirectTo - Optional redirect URL after authentication
 */
export async function signInWithFacebook(redirectTo?: string): Promise<void> {
  return signInWithOAuth('facebook', redirectTo);
}

/**
 * Handle OAuth callback and get the session
 * This should be called on the callback page after OAuth redirect
 * Properly handles URL hash fragments that Supabase OAuth uses
 */
export async function handleOAuthCallback(): Promise<{
  session: any;
  user: any;
} | null> {
  try {
    // Supabase OAuth redirects with hash fragments (#access_token=...)
    // We need to extract these and exchange them for a session
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Set the session using the tokens from the URL hash
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        throw new Error(`Failed to set session: ${error.message}`);
      }

      if (!data.session) {
        return null;
      }

      // Clear the hash from URL for security
      window.history.replaceState(null, '', window.location.pathname);

      return {
        session: data.session,
        user: data.session.user,
      };
    }

    // Fallback: try to get existing session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }

    if (!data.session) {
      return null;
    }

    return {
      session: data.session,
      user: data.session.user,
    };
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Listen to auth state changes
 * Useful for syncing auth state with your backend
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

