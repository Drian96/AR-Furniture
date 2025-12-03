-- Disable Row Level Security on notifications table
-- Also remove old policies that referenced Supabase Auth

ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can receive notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

