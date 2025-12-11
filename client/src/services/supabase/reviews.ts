// =============================
// Review Service
// Handles all product review-related operations
// =============================

import { supabase } from './client';
import type { ProductReview, ProductReviewStats } from './types';

export const reviewService = {
  // Create a new product review
  async createReview(reviewData: {
    order_id: number;
    product_id: string;
    user_id: number;
    rating: number;
    comment?: string;
  }): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert([{ ...reviewData, status: 'pending' }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get reviews for a specific product
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          users!inner(first_name, last_name)
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch product reviews: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Get review statistics for a product
  async getProductReviewStats(productId: string): Promise<ProductReviewStats | null> {
    try {
      const { data, error } = await supabase
        .from('product_review_stats')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No reviews found
          return null;
        }
        throw new Error(`Failed to fetch review stats: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  },

  // Check if user has already reviewed a product from a specific order
  async hasUserReviewedProduct(orderId: number, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('order_id', orderId)
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No review found
          return false;
        }
        throw new Error(`Failed to check review: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('Error checking review:', error);
      return false;
    }
  },

  // Update an existing review
  async updateReview(reviewId: string, updates: {
    rating?: number;
    comment?: string;
  }): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        throw new Error(`Failed to delete review: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get all reviews for admin (with user and product info)
  async getAllReviews(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          users!inner(first_name, last_name),
          products!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch all reviews: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  },

  // Approve a review
  async approveReview(reviewId: string): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to approve review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  },

  // Reject a review
  async rejectReview(reviewId: string): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reject review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  }
};

