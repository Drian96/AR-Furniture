// =============================
// Wishlist Utility
// Handles wishlist operations using localStorage
// =============================

const WISHLIST_STORAGE_KEY = 'arf_wishlist_v1';

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

/**
 * Get all wishlist items from localStorage
 */
export const getWishlist = (): WishlistItem[] => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as WishlistItem[];
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    return [];
  }
};

/**
 * Check if a product is in the wishlist
 */
export const isInWishlist = (productId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(item => item.productId === productId);
};

/**
 * Add a product to the wishlist
 */
export const addToWishlist = (productId: string): void => {
  try {
    const wishlist = getWishlist();
    if (!isInWishlist(productId)) {
      wishlist.push({
        productId,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    }
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
  }
};

/**
 * Remove a product from the wishlist
 */
export const removeFromWishlist = (productId: string): void => {
  try {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(item => item.productId !== productId);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
  }
};

/**
 * Toggle a product in the wishlist (add if not present, remove if present)
 */
export const toggleWishlist = (productId: string): boolean => {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  } else {
    addToWishlist(productId);
    return true;
  }
};
