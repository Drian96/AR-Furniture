import { useState, useEffect } from 'react';
import { Search, Star, Eye, Trash2, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { reviewService, ProductReview } from '../../services/supabase';

// Rates and reviews management component for admin
const AdminRatesReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    publishedReviews: 0
  });

  // Load reviews on component mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const allReviews = await reviewService.getAllReviews();
      setReviews(allReviews);
      
      // Calculate stats
      const totalReviews = allReviews.length;
      const approvedReviews = allReviews.filter(review => review.status === 'approved');
      const pendingReviews = allReviews.filter(review => review.status === 'pending');
      const averageRating = approvedReviews.length > 0 
        ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length 
        : 0;
      
      setStats({
        totalReviews,
        averageRating,
        pendingReviews: pendingReviews.length,
        publishedReviews: approvedReviews.length
      });
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await reviewService.approveReview(reviewId);
      await loadReviews();
      alert('Review approved successfully.');
    } catch (error) {
      console.error('Failed to approve review:', error);
      alert('Failed to approve review. Please try again.');
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      await reviewService.rejectReview(reviewId);
      await loadReviews();
      alert('Review rejected successfully.');
    } catch (error) {
      console.error('Failed to reject review:', error);
      alert('Failed to reject review. Please try again.');
    }
  };

  const handleDeleteReview = (review: ProductReview) => {
    setSelectedReview(review);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;
    
    try {
      await reviewService.deleteReview(selectedReview.id);
      await loadReviews();
      setShowDeleteConfirm(false);
      setSelectedReview(null);
      alert('Review deleted successfully.');
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Filter reviews based on selected criteria
  const filteredReviews = reviews.filter(review => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Published') return review.status === 'approved';
    if (selectedFilter === 'Pending') return review.status === 'pending';
    if (selectedFilter === 'High Rated') return review.rating >= 4;
    if (selectedFilter === 'Low Rated') return review.rating <= 2;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Rates & Reviews</h1>
        <p className="text-dgray mt-1">Manage customer reviews and ratings</p>
      </div>

      {/* Overview Stats */}
      {/* TODO: When backend is ready, calculate real statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Total Reviews</h3>
          <p className="text-2xl font-bold text-dgreen">{stats.totalReviews}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Average Rating</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-dgreen">{stats.averageRating.toFixed(1)}</p>
            <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Pending Reviews</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Published Reviews</h3>
          <p className="text-2xl font-bold text-green-600">{stats.publishedReviews}</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      {/* TODO: When backend is ready, implement real search functionality */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>All</option>
            <option>Published</option>
            <option>Pending</option>
            <option>High Rated</option>
            <option>Low Rated</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dgreen"></div>
              <p className="mt-2 text-dgray">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dgray">No reviews found.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className="border border-sage-light rounded-lg p-4 hover:bg-cream transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-dgreen">
                      {(review as any).users?.first_name} {(review as any).users?.last_name}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Verified Purchase
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {review.status === 'approved' ? 'Published' : 
                       review.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </div>
                  <p className="text-sm text-dgray mb-1">Product: {(review as any).products?.name}</p>
                  <p className="text-sm text-dgray mb-1">Order ID: {review.order_id}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-dgray">{review.rating}/5</span>
                    <span className="text-sm text-dgray">•</span>
                    <span className="text-sm text-dgray">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.comment && (
                    <p className="text-dgreen">{review.comment}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {review.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApproveReview(review.id)}
                        className="text-green-600 hover:text-green-800 px-2 py-1 text-sm"
                        title="Approve Review"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectReview(review.id)}
                        className="text-orange-600 hover:text-orange-800 px-2 py-1 text-sm"
                        title="Reject Review"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {review.status === 'approved' && (
                    <button 
                      onClick={() => handleRejectReview(review.id)}
                      className="text-orange-600 hover:text-orange-800 px-2 py-1 text-sm"
                      title="Reject Review"
                    >
                      Reject
                    </button>
                  )}
                  {review.status === 'rejected' && (
                    <button 
                      onClick={() => handleApproveReview(review.id)}
                      className="text-green-600 hover:text-green-800 px-2 py-1 text-sm"
                      title="Approve Review"
                    >
                      Approve
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteReview(review)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Delete Review</h3>
              <p className="text-dgray">
                Are you sure you want to delete this review from <span className="font-medium">User #{selectedReview.user_id}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRatesReviews;