import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { cartService, supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'arf_cart_v1';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // On auth, sync with Supabase cart
  useEffect(() => {
    const sync = async () => {
      if (!isAuthenticated || !user?.id) return;
      try {
        const cart = await cartService.getOrCreateActiveCart(user.id);
        setCartId(cart.id);

        // Push local items to server if server is empty
        const serverItems = await cartService.getItems(cart.id);
        if (serverItems.length === 0 && items.length > 0) {
          for (const it of items) {
            await cartService.upsertItem(cart.id, it.productId, it.quantity, it.price);
          }
        } else if (serverItems.length > 0) {
          // Prefer server items into local - fetch product details
          const merged: CartItem[] = await Promise.all(
            serverItems.map(async (si) => {
              try {
                // Fetch product details from Supabase
                const { data: product } = await supabase
                  .from('products')
                  .select('name, price')
                  .eq('id', si.product_id)
                  .single();
                
                // Fetch product image
                const { data: images } = await supabase
                  .from('product_images')
                  .select('image_url')
                  .eq('product_id', si.product_id)
                  .eq('is_primary', true)
                  .single();

                return {
                  productId: si.product_id,
                  name: product?.name || '(Product)',
                  price: si.unit_price,
                  imageUrl: images?.image_url,
                  quantity: si.quantity,
                };
              } catch (error) {
                console.error('Failed to fetch product details:', error);
                return {
                  productId: si.product_id,
                  name: '(Product)',
                  price: si.unit_price,
                  imageUrl: undefined,
                  quantity: si.quantity,
                };
              }
            })
          );
          setItems(merged);
        }
      } catch (e) {
        console.error('Cart sync failed:', e);
        // ignore silently for now
      }
    };
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartContextValue['addItem'] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      if (existing) {
        return prev.map((p) => (p.productId === item.productId ? { ...p, quantity: p.quantity + quantity } : p));
      }
      return [...prev, { ...item, quantity }];
    });
    // server
    if (cartId) {
      cartService.upsertItem(cartId, item.productId, quantity, item.price).catch((error) => {
        console.error('Failed to add item to database:', error);
      });
    }
  };

  const updateQuantity: CartContextValue['updateQuantity'] = (productId, quantity) => {
    setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, quantity } : p)).filter((p) => p.quantity > 0));
    if (cartId) {
      cartService.setQuantity(cartId, productId, quantity).catch((error) => {
        console.error('Failed to update quantity in database:', error);
      });
    }
  };

  const removeItem: CartContextValue['removeItem'] = (productId) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
    if (cartId) {
      cartService.removeItem(cartId, productId).catch((error) => {
        console.error('Failed to remove item from database:', error);
      });
    }
  };

  const clear = () => {
    setItems([]);
    if (cartId) {
      cartService.clear(cartId).catch((error) => {
        console.error('Failed to clear cart in database:', error);
      });
    }
  };

  const totals = useMemo(() => {
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.quantity * i.price, 0);
    return { totalQuantity, totalPrice };
  }, [items]);

  const value: CartContextValue = {
    items,
    totalQuantity: totals.totalQuantity,
    totalPrice: totals.totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};


