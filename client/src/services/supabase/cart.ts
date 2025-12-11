// =============================
// Cart Service
// Handles all cart-related operations
// =============================

import { supabase } from './client';
import type { Cart, CartItemRow } from './types';

export const cartService = {
  async getOrCreateActiveCart(userId: number): Promise<Cart> {
    console.log('🛒 Getting/creating cart for user:', userId);
    
    // First try to get existing active cart
    const { data: existing, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existing && !fetchError) {
      console.log('✅ Found existing cart:', existing.id);
      return existing as Cart;
    }

    console.log('📝 No existing cart found, creating new one...');
    
    // If no existing cart, create new one
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert([{ user_id: userId, status: 'active' }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create cart:', createError);
      throw new Error(`Failed to create cart: ${createError.message}`);
    }
    
    console.log('✅ Created new cart:', newCart.id);
    return newCart as Cart;
  },

  async getItems(cartId: string): Promise<CartItemRow[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch cart items: ${error.message}`);
    return data || [];
  },

  async upsertItem(cartId: string, productId: string, quantityDelta: number, unitPrice: number): Promise<void> {
    console.log('🛒 Upserting cart item:', { cartId, productId, quantityDelta, unitPrice });
    
    // Try to fetch existing item
    const { data: existing, error: selectErr } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (!selectErr && existing) {
      console.log('📝 Updating existing item:', existing.id);
      const newQty = Math.max(1, (existing.quantity || 0) + quantityDelta);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty, unit_price: unitPrice })
        .eq('id', existing.id);
      if (error) {
        console.error('❌ Failed to update cart item:', error);
        throw new Error(`Failed to update cart item: ${error.message}`);
      }
      console.log('✅ Updated cart item successfully');
      return;
    }

    console.log('📝 Creating new cart item...');
    // If not found, insert
    const { error: insertErr } = await supabase
      .from('cart_items')
      .insert([{ cart_id: cartId, product_id: productId, quantity: Math.max(1, quantityDelta), unit_price: unitPrice }]);
    if (insertErr) {
      console.error('❌ Failed to add cart item:', insertErr);
      throw new Error(`Failed to add cart item: ${insertErr.message}`);
    }
    console.log('✅ Added cart item successfully');
  },

  async setQuantity(cartId: string, productId: string, quantity: number, unitPrice?: number): Promise<void> {
    if (quantity <= 0) return this.removeItem(cartId, productId);
    const patch: any = { quantity };
    if (typeof unitPrice === 'number') patch.unit_price = unitPrice;
    const { error } = await supabase
      .from('cart_items')
      .update(patch)
      .eq('cart_id', cartId)
      .eq('product_id', productId);
    if (error) throw new Error(`Failed to set quantity: ${error.message}`);
  },

  async removeItem(cartId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId);
    if (error) throw new Error(`Failed to remove item: ${error.message}`);
  },

  async clear(cartId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);
    if (error) throw new Error(`Failed to clear cart: ${error.message}`);
  }
};

