// Notification utility for backend
// Creates notifications in Supabase when orders are created/updated

const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

// Initialize Supabase client for backend operations
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for backend

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not found. Notifications will not be created.');
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Create a notification for a user
 * @param {Object} notificationData - Notification data
 * @param {number} notificationData.user_id - User ID
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type (info, success, warning, error, order, promotion)
 * @param {string} [notificationData.link] - Optional link to navigate to
 * @param {Object} [notificationData.metadata] - Optional metadata
 */
const createNotification = async (notificationData) => {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured. Skipping notification creation.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: notificationData.user_id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        link: notificationData.link || null,
        metadata: notificationData.metadata || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create notification:', error);
      return null;
    }

    console.log('✅ Notification created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

/**
 * Create order-related notifications
 */
const createOrderNotification = async (userId, orderNumber, orderId, status, totalAmount) => {
  const statusMessages = {
    pending: {
      title: 'Order Placed',
      message: `Your order #${orderNumber} has been placed successfully. Total: ₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
    },
    confirmed: {
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed and is being processed.`,
    },
    shipped: {
      title: 'Order Shipped',
      message: `Your order #${orderNumber} has been shipped and is on its way!`,
    },
    delivered: {
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered. We hope you enjoy your purchase!`,
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order #${orderNumber} has been cancelled.`,
    },
  };

  const statusInfo = statusMessages[status] || {
    title: 'Order Update',
    message: `Your order #${orderNumber} status has been updated to ${status}.`,
  };

  return await createNotification({
    user_id: userId,
    title: statusInfo.title,
    message: statusInfo.message,
    type: 'order',
    link: `/orders/${orderId}`,
    metadata: {
      order_id: orderId,
      order_number: orderNumber,
      status: status,
    },
  });
};

// ====================================================================
// Admin notifications
// ====================================================================

const ADMIN_ROLES = ['admin', 'manager', 'staff'];

const fetchAdminUsers = async () => {
  try {
    const admins = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
      where: { role: ADMIN_ROLES },
    });
    return admins;
  } catch (error) {
    console.error('❌ Failed to fetch admin users for notifications:', error.message);
    return [];
  }
};

const createAdminOrderNotification = async ({ orderNumber, orderId, totalAmount, customerName, event }) => {
  const admins = await fetchAdminUsers();
  if (admins.length === 0) {
    console.warn('⚠️ No admin users found to notify.');
    return;
  }

  const eventMessages = {
    new_order: {
      title: 'New Order Placed',
      message: `${customerName} placed order #${orderNumber} • ₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
    },
    cancelled: {
      title: 'Order Cancelled by Customer',
      message: `${customerName} cancelled order #${orderNumber}`,
    },
    return_refund: {
      title: 'Return/Refund Requested',
      message: `${customerName} requested a return/refund for order #${orderNumber}`,
    },
  };

  const { title, message } = eventMessages[event] || {
    title: 'Order Update',
    message: `${customerName} updated order #${orderNumber} (${event})`,
  };

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        user_id: admin.id,
        title,
        message,
        type: 'order',
        link: '/admin/orders',
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
          event,
          customer_name: customerName,
        },
      })
    )
  );
};

module.exports = {
  createNotification,
  createOrderNotification,
  createAdminOrderNotification,
};

