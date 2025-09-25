
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { productService, reviewService, type Product as DbProduct, type ProductImage, type ProductReview, type ProductReviewStats } from '../../services/supabase';
import { useCart } from '../../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const p = await productService.getProductById(id);
      if (p) {
        setProduct(p);
        setImages(await productService.getProductImages(p.id));
        
        // Load reviews
        setLoadingReviews(true);
        try {
          const [reviewsData, statsData] = await Promise.all([
            reviewService.getProductReviews(p.id),
            reviewService.getProductReviewStats(p.id)
          ]);
          setReviews(reviewsData);
          setReviewStats(statsData);
        } catch (error) {
          console.error('Failed to load reviews:', error);
        } finally {
          setLoadingReviews(false);
        }
      }
    };
    load();
  }, [id]);

  const productImages = useMemo(() => images.map(i => i.image_url), [images]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && quantity < (product?.quantity ?? 0)) {
      setQuantity(quantity + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const firstImage = images[0]?.image_url;
    addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: firstImage }, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    console.log(`Buying ${quantity} ${product.name}`);
    // TODO: Implement buy now functionality
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/products" 
          className="inline-flex items-center text-dgreen hover:text-lgreen mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-lg">
                  {product ? (
                    <img 
                      src={productImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
            </div>
            <div className="grid grid-cols-4 gap-4">
                  {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-dgreen' : ''
                  }`}
                >
                  <img 
                    src={image}
                        alt={`${product?.name ?? 'product'} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
                  {/* New badge could be based on created_at */}
                  {false && (
                <span className="inline-block bg-dgreen text-cream px-3 py-1 rounded-full text-sm font-medium mb-4">
                  New Arrival
                </span>
              )}
                  <h1 className="text-3xl font-bold text-dgreen mb-2">{product?.name || ''}</h1>
                  <p className="text-lgray font-medium">{product?.category || ''}</p>
            </div>

                <div className="text-4xl font-bold text-dgreen">
                  {product ? `₱${product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : ''}
                </div>

            <p className="text-dgray leading-relaxed">
                  {product?.description || ''}
            </p>

            <div className="flex items-center space-x-4">
                  <span className="text-dgray">In Stock: {product?.quantity ?? 0} items</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-dgray font-medium">Quantity:</span>
              <div className="flex items-center border-2 border-lgreen rounded-lg">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  className="px-4 py-2 text-dgreen hover:bg-lgreen hover:text-cream transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  className="px-4 py-2 text-dgreen hover:bg-lgreen hover:text-cream transition-colors"
                >
                  +
                </button>
              </div>
                            <button
                              onClick={handleAddToCart}
                              className="bg-red-900 text-cream px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-all duration-300 text-lg cursor-pointer"
                            > TRY NOW!</button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-dgreen text-cream px-8 py-4 rounded-lg font-medium hover:bg-lgreen transition-all duration-300 text-lg cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-dgreen text-cream px-8 py-4 rounded-lg font-medium hover:bg-lgreen transition-all duration-300 text-lg cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-lgray">
              <button className="flex items-center space-x-2 text-dgray hover:text-dgreen transition-colors">
                <Heart className="w-5 h-5" />
                <span>Add to Wishlist</span>
              </button>
              <button className="flex items-center space-x-2 text-dgray hover:text-dgreen transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-2xl font-bold text-dgreen mb-6">Customer Reviews</h3>
          
          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dgreen"></div>
              <p className="mt-2 text-dgray">Loading reviews...</p>
            </div>
          ) : reviewStats ? (
            <div className="mb-8">
              {/* Review Summary */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-dgreen">{reviewStats.average_rating.toFixed(1)}</div>
                  <div className="flex items-center justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-2xl ${
                          star <= Math.round(reviewStats.average_rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-dgray">Based on {reviewStats.total_reviews} reviews</div>
                </div>
                
                {/* Rating Breakdown */}
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = rating === 5 ? reviewStats.five_star_count :
                                 rating === 4 ? reviewStats.four_star_count :
                                 rating === 3 ? reviewStats.three_star_count :
                                 rating === 2 ? reviewStats.two_star_count :
                                 reviewStats.one_star_count;
                    const percentage = reviewStats.total_reviews > 0 ? (count / reviewStats.total_reviews) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-2 mb-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-dgray w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-dgray">No reviews yet. Be the first to review this product!</p>
            </div>
          )}

          {/* Individual Reviews */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-dgreen mb-4">Customer Reviews</h4>
              {reviews.map((review) => (
                <div key={review.id} className="border border-lgray rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-dgreen">
                        {(review as any).users?.first_name} {(review as any).users?.last_name}
                      </span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-dgray">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-dgray">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
