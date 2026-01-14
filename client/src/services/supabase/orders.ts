// =============================
// Order Service
// Handles all order-related operations
// =============================

import { supabase } from './client';
import type { Order, OrderItem, CreateOrderData } from './types';

// Import notificationService dynamically to avoid circular dependency
const getNotificationService = () => import('./notifications').then(m => m.notificationService);

export const orderService = {
  // Create a new order with items
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      console.log('📦 Creating order:', orderData);
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          first_name: orderData.first_name,
          last_name: orderData.last_name,
          email: orderData.email,
          phone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          postal_code: orderData.postal_code,
          notes: orderData.notes,
          payment_method: orderData.payment_method,
          total_amount: orderData.total_amount
        }])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Failed to create order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('✅ Order created:', order.id);

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Failed to create order items:', itemsError);
        // Try to clean up the order if items creation failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('✅ Order items created successfully');
      
      // Create a notification for the user about their new order
      try {
        const notificationService = await getNotificationService();
        await notificationService.createNotification({
          user_id: orderData.user_id,
          title: 'Order Confirmed',
          message: `Your order #${order.order_number} has been confirmed. Total: ₱${orderData.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          type: 'order',
          link: `/orders/${order.id}`,
          metadata: { order_id: order.id, order_number: order.order_number },
        });
      } catch (notifError) {
        // Don't fail the order creation if notification fails
        console.warn('⚠️ Failed to create order notification:', notifError);
      }
      
      return order as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get orders for a user
  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get order with items
  async getOrderWithItems(orderId: number): Promise<{ order: Order; items: OrderItem[] }> {
    try {
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw new Error(`Failed to fetch order: ${orderError.message}`);
      }

      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`);
      }

      return {
        order: order as Order,
        items: items || []
      };
    } catch (error) {
      console.error('Error fetching order with items:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: number, status: Order['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get all orders (for admin)
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Get order with items and product details (for admin)
  async getOrderWithDetails(orderId: number): Promise<{
    order: Order;
    items: (OrderItem & { product_name: string; product_image?: string })[];
  }> {
    try {
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw new Error(`Failed to fetch order: ${orderError.message}`);
      }

      // Get order items with product details
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products!inner(name)
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`);
      }

      // Get product images for each product
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const product = item.products as any;
          
          // Get primary image for this product
          const { data: productImages } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', item.product_id)
            .eq('is_primary', true)
            .single();
          
          return {
            ...item,
            product_name: product?.name || 'Unknown Product',
            product_image: productImages?.image_url || null
          };
        })
      );

      return {
        order: order as Order,
        items: itemsWithDetails
      };
    } catch (error) {
      console.error('Error fetching order with details:', error);
      throw error;
    }
  },

  // Delete a single order (order_items will be deleted automatically due to CASCADE)
  async deleteOrder(orderId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        throw new Error(`Failed to delete order: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // Delete completed orders (delivered or cancelled) older than retention days
  async deleteCompletedOrders(retentionDays: number = 30): Promise<number> {
    try {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - retentionDays);
      const retentionDateString = retentionDate.toISOString();

      // Get orders to delete
      const { data: ordersToDelete, error: fetchError } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['delivered', 'cancelled'])
        .lt('updated_at', retentionDateString);

      if (fetchError) {
        throw new Error(`Failed to fetch orders to delete: ${fetchError.message}`);
      }

      if (!ordersToDelete || ordersToDelete.length === 0) {
        return 0;
      }

      const orderIds = ordersToDelete.map(order => order.id);

      // Delete orders (order_items will be deleted automatically due to CASCADE)
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .in('id', orderIds);

      if (deleteError) {
        throw new Error(`Failed to delete orders: ${deleteError.message}`);
      }

      return orderIds.length;
    } catch (error) {
      console.error('Error deleting completed orders:', error);
      throw error;
    }
  }
};

