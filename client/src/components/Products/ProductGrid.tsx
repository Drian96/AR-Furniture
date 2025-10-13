
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, type Product as DbProduct, type ProductImage } from '../../services/supabase';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductGridProps {
  selectedCategory: string;
  sortBy: string;
}

const ProductGrid = ({ selectedCategory, sortBy }: ProductGridProps) => {
  const [items, setItems] = useState<DbProduct[]>([]);
  const [imagesByProduct, setImagesByProduct] = useState<Record<string, ProductImage[]>>({});
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const products = await productService.getProducts();
      setItems(products);
      const map: Record<string, ProductImage[]> = {};
      for (const p of products) {
        map[p.id] = await productService.getProductImages(p.id);
      }
      setImagesByProduct(map);
      setLoading(false);
    };
    load();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory === 'All' 
      ? items 
      : items.filter(product => product.category === selectedCategory);

    switch (sortBy) {
      case 'Lowest Price':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'Highest Price':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'Newest':
        return filtered; // no created_at here in component; could sort by created_at if needed
      default:
        return filtered;
    }
  }, [items, selectedCategory, sortBy]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {loading ? (
        <div className="col-span-full text-center text-dgray">Loading...</div>
      ) : filteredAndSortedProducts.map((product) => (
        <div key={product.id} className="group cursor-pointer">
          <Link to={`/product/${product.id}`}>
            <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
              {(() => {
                const imgs = imagesByProduct[product.id];
                const src = imgs && imgs.length > 0 ? imgs[0].image_url : '';
                return (
                  <img 
                    src={src}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                );
              })()}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              {/* could show badges here based on status */}
              <div className="absolute top-4 right-4">
                <span className="bg-lgreen text-cream px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-4">
              <h3 className="text-xl font-semibold text-dgreen mb-2 group-hover:text-lgreen transition-colors">
                {product.name}
              </h3>
              <p className="text-2xl font-bold text-dgreen">
                ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  const firstImage = imagesByProduct[product.id]?.[0]?.image_url;
                  addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: firstImage }, 1);
                }}
                className="w-full mt-4 bg-dgreen text-cream px-6 py-3 rounded-lg font-medium hover:bg-lgreen cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
