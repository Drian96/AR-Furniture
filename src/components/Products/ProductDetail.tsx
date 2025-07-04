
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  isNew: boolean;
  description: string;
  inStock: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data - in real app this would come from API
  const product: Product = {
    id: parseInt(id || '1'),
    name: "Modern Oak Dining Table",
    price: 1299,
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "Tables",
    isNew: true,
    description: "Crafted from premium oak wood, this modern dining table combines elegance with functionality. Perfect for family gatherings and dinner parties. Features a durable finish that resists scratches and stains.",
    inStock: 15
  };

  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image
  ];

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && quantity < product.inStock) {
      setQuantity(quantity + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    console.log(`Added ${quantity} ${product.name} to cart`);
    // TODO: Implement add to cart functionality
  };

  const handleBuyNow = () => {
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
              <img 
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.isNew && (
                <span className="inline-block bg-dgreen text-cream px-3 py-1 rounded-full text-sm font-medium mb-4">
                  New Arrival
                </span>
              )}
              <h1 className="text-3xl font-bold text-dgreen mb-2">{product.name}</h1>
              <p className="text-lgray font-medium">{product.category}</p>
            </div>

            <div className="text-4xl font-bold text-dgreen">
              ${product.price.toLocaleString()}
            </div>

            <p className="text-dgray leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center space-x-4">
              <span className="text-dgray">In Stock: {product.inStock} items</span>
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
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-lgreen text-cream px-8 py-4 rounded-lg font-medium hover:bg-dgreen transition-all duration-300 text-lg"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-dgreen text-cream px-8 py-4 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 text-lg"
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
    </div>
  );
};

export default ProductDetail;
