import { createClient } from '@supabase/supabase-js';

// Supabase configuration
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

