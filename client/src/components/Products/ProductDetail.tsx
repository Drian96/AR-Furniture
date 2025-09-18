
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { productService, type Product as DbProduct, type ProductImage } from '../../services/supabase';
import { useCart } from '../../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const p = await productService.getProductById(id);
      if (p) {
        setProduct(p);
        setImages(await productService.getProductImages(p.id));
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
    </div>
  );
};

export default ProductDetail;
