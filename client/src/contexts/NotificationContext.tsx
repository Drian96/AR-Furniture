import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { notificationService, type Notification } from '../services/supabase';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

// Type for notification context value
type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Function to refresh notifications from the database
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching notifications for user:', user.id);
      
      // Fetch notifications and unread count in parallel
      const [notifs, unread] = await Promise.all([
        notificationService.getNotifications(user.id),
        notificationService.getUnreadCount(user.id),
      ]);
      
      console.log('✅ Notifications fetched:', notifs.length, 'unread:', unread);
      setNotifications(notifs);
      setUnreadCount(unread);
    } catch (error) {
      console.error('❌ Failed to refresh notifications:', error);
      // Set empty arrays on error so UI doesn't break
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Set up Supabase Realtime subscription for real-time notifications
  // This is the modern/professional way - uses WebSocket connection instead of polling
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Load notifications once when user logs in
      refreshNotifications();
      return;
    }

    // Initial load
    refreshNotifications();

    let fallbackInterval: NodeJS.Timeout | undefined;

    // Set up Supabase Realtime subscription
    // This listens for INSERT events on the notifications table for this user
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`, // Only listen to notifications for this user
        },
        (payload) => {
          console.log('🔔 New notification received via Realtime:', payload.new);
          // Add the new notification to the list
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Notification updated via Realtime:', payload.new);
          // Update the notification in the list
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === payload.new.id ? (payload.new as Notification) : notif
            )
          );
          // Update unread count if read status changed
          if (payload.old.read !== payload.new.read) {
            setUnreadCount((prev) => (payload.new.read ? Math.max(0, prev - 1) : prev + 1));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🗑️ Notification deleted via Realtime:', payload.old.id);
          // Remove the notification from the list
          setNotifications((prev) => prev.filter((notif) => notif.id !== payload.old.id));
          // Update unread count if it was unread
          if (!payload.old.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to real-time notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to notifications');
          // Fallback to polling if Realtime fails
          fallbackInterval = setInterval(() => {
            refreshNotifications();
          }, 30000);
        }
      });

    // Cleanup: unsubscribe when component unmounts or user changes
    return () => {
      console.log('🔌 Unsubscribing from notifications');
      supabase.removeChannel(channel);
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [isAuthenticated, user?.id, refreshNotifications]);

  // Function to mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Refresh to get the correct state
      refreshNotifications();
    }
  }, [refreshNotifications]);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      // Update local state optimistically
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Refresh to get the correct state
      refreshNotifications();
    }
  }, [user?.id, refreshNotifications]);

  // Function to delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Update local state
      const deleted = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Refresh to get the correct state
      refreshNotifications();
    }
  }, [notifications, refreshNotifications]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

