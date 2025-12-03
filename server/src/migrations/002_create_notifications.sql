-- Create notifications table for user notifications
-- This table stores all notifications for users (order updates, promotions, etc.)

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'order', 'promotion')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT, -- Optional link to navigate when notification is clicked (e.g., /orders/123)
  metadata JSONB, -- Optional additional data (e.g., order_id, product_id, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- Create a function to automatically create notifications for order status changes
-- This will be called via triggers or application logic

-- Grant necessary permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable Row Level Security (RLS) so users can only see their own notifications
-- Note: Since we're using custom auth, we'll use a simpler approach
-- For now, disable RLS and handle security in the application layer
-- Or use service role for all operations

-- Option 1: Disable RLS (simpler for custom auth systems)
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Option 2: If using Supabase Auth, uncomment and use these policies:
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view their own notifications"
--   ON public.notifications
--   FOR SELECT
--   USING (user_id = (SELECT id FROM users WHERE email = auth.email() LIMIT 1));
-- 
-- CREATE POLICY "Users can receive notifications"
--   ON public.notifications
--   FOR INSERT
--   WITH CHECK (true);
-- 
-- CREATE POLICY "Users can update their own notifications"
--   ON public.notifications
--   FOR UPDATE
--   USING (user_id = (SELECT id FROM users WHERE email = auth.email() LIMIT 1));
-- 
-- CREATE POLICY "Users can delete their own notifications"
--   ON public.notifications
--   FOR DELETE
--   USING (user_id = (SELECT id FROM users WHERE email = auth.email() LIMIT 1));

