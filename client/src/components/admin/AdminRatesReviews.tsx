import { useState } from 'react';
import { Search, Star, Eye, Trash2, X, ThumbsUp, ThumbsDown } from 'lucide-react';

// Rates and reviews management component for admin
// TODO: When backend is connected, fetch real reviews data from your Express API
const AdminRatesReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // TODO: Replace with actual reviews data from backend API
  const reviews = [
    {
      id: "REV001",
      customer: "John Smith",
      product: "Power Drill Kit KJ-2000",
      rating: 5,
      review: "Excellent product! Very powerful and well-built. Great value for money. Highly recommend to anyone looking for a reliable drill kit.",
      date: "2024-01-15",
      status: "Published",
      helpful: 12,
      notHelpful: 1,
      verified: true
    },
    {
      id: "REV002",
      customer: "Sarah Wilson", 
      product: "Hammer Set Pro",
      rating: 4,
      review: "Good quality hammers. The weight distribution is perfect. Only issue is the handle could be more comfortable for extended use.",
      date: "2024-01-14",
      status: "Published",
      helpful: 8,
      notHelpful: 0,
      verified: true
    },
    {
      id: "REV003",
      customer: "Mike Johnson",
      product: "Safety Goggles",
      rating: 2,
      review: "Disappointed with the quality. The lens scratched easily and the strap broke after just a week of use. Would not recommend.",
      date: "2024-01-13", 
      status: "Pending",
      helpful: 3,
      notHelpful: 5,
      verified: false
    },
    {
      id: "REV004",
      customer: "Emma Davis",
      product: "Wrench Collection",
      rating: 5,
      review: "Amazing set of wrenches! Precise fit and durable construction. Perfect for both professional and home use.",
      date: "2024-01-12",
      status: "Published",
      helpful: 15,
      notHelpful: 0,
      verified: true
    }
  ];

  // TODO: When backend is ready, implement actual review moderation
  const handleApproveReview = (reviewId: string) => {
    console.log('Approve review:', reviewId);
    // TODO: API call to approve review
  };

  const handleRejectReview = (reviewId: string) => {
    console.log('Reject review:', reviewId);
    // TODO: API call to reject/hide review
  };

  const handleDeleteReview = (review: any) => {
    setSelectedReview(review);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    console.log('Deleting review:', selectedReview?.id);
    // TODO: API call to delete review
    setShowDeleteConfirm(false);
    setSelectedReview(null);
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
    if (selectedFilter === 'Published') return review.status === 'Published';
    if (selectedFilter === 'Pending') return review.status === 'Pending';
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
          <p className="text-2xl font-bold text-dgreen">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Average Rating</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-dgreen">4.0</p>
            <div className="flex">{renderStars(4)}</div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Pending Reviews</h3>
          <p className="text-2xl font-bold text-orange-600">
            {reviews.filter(r => r.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Published Reviews</h3>
          <p className="text-2xl font-bold text-green-600">
            {reviews.filter(r => r.status === 'Published').length}
          </p>
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
        {/* TODO: When backend is ready, implement pagination */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className="border border-sage-light rounded-lg p-4 hover:bg-cream transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-dgreen">{review.customer}</h3>
                    {review.verified && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Verified Purchase
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      review.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                  <p className="text-sm text-dgray mb-1">Product: {review.product}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-dgray">{review.rating}/5</span>
                    <span className="text-sm text-dgray">•</span>
                    <span className="text-sm text-dgray">{review.date}</span>
                  </div>
                  <p className="text-dgreen">{review.review}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-dgray">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{review.helpful}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-dgray">
                      <ThumbsDown className="w-4 h-4" />
                      <span>{review.notHelpful}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {review.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => handleApproveReview(review.id)}
                        className="text-green-600 hover:text-green-800 px-2 py-1 text-sm"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectReview(review.id)}
                        className="text-orange-600 hover:text-orange-800 px-2 py-1 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDeleteReview(review)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                Are you sure you want to delete this review from <span className="font-medium">{selectedReview.customer}</span>? 
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