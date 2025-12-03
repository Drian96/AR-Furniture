-- Enable Realtime for notifications table
-- This allows the frontend to subscribe to real-time changes via WebSocket

-- Add the notifications table to the supabase_realtime publication
-- This enables PostgreSQL logical replication for Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Verify it was added (optional - you can check in Supabase dashboard)
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

