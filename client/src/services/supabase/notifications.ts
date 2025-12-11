// =============================
// Notification Service
// Handles all notification-related operations
// =============================

import { supabase } from './client';
import type { Notification } from './types';

export const notificationService = {
  /**
   * Get all notifications for the current user
   * Returns notifications ordered by most recent first
   */
  async getNotifications(userId: number): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count for the current user
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0; // Return 0 on error to not break the UI
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Create a new notification (typically called by backend/system)
   * Note: In production, this should be called with service role, not from client
   */
  async createNotification(notification: {
    user_id: number;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promotion';
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          link: notification.link || null,
          metadata: notification.metadata || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

