import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { productService, type Product as DbProduct, type ProductImage } from '../../services/supabase';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCartAnimation } from '../../contexts/CartAnimationContext';
import { is3DModel } from '../../utils/modelUtils';
import Model3DViewer from './Model3DViewer';

interface ProductGridProps {
  selectedCategory: string;
  sortBy: string;
  searchQuery?: string;
  initialPage?: number;
}

const ProductGrid = ({ selectedCategory, sortBy, searchQuery = '', initialPage = 1 }: ProductGridProps) => {
  const [items, setItems] = useState<DbProduct[]>([]);
  const [imagesByProduct, setImagesByProduct] = useState<Record<string, ProductImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(initialPage > 0 ? initialPage : 1);
  const pageSize = 16;
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { triggerAnimation } = useCartAnimation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Sync currentPage with URL 'page' param on mount and when params change
  useEffect(() => {
    const urlPage = Number.parseInt(searchParams.get('page') || `${initialPage}`, 10) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Reset to first page when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    // preserve existing params like 'q'
    setSearchParams(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, searchQuery]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = items;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
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
  }, [items, selectedCategory, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(next);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(next));
    setSearchParams(newParams);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full text-center text-dgray">Loading...</div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-dgray mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-dgreen mb-2">
                {searchQuery.trim() ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-dgray">
                {searchQuery.trim() 
                  ? `No products match "${searchQuery}". Try a different search term.`
                  : 'No products are currently available in this category.'
                }
              </p>
            </div>
          </div>
        ) : pagedProducts.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <Link to={`/product/${product.id}`}>
              <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
                {(() => {
                  const imgs = imagesByProduct[product.id];
                  const src = imgs && imgs.length > 0 ? imgs[0].image_url : '';
                  
                  // Check if the first image is a 3D model
                  if (src && is3DModel(src)) {
                    return (
                      <div className="w-full h-64 relative">
                        <Model3DViewer 
                          modelUrl={src}
                          className="w-full h-full"
                          autoRotate={true}
                          enableControls={false}
                          rotationSpeed={0.3}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-dgreen text-cream px-2 py-1 rounded text-xs font-medium">
                            3D Model
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      <img 
                        src={src}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    </>
                  );
                })()}
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
                    
                    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const startX = buttonRect.left + buttonRect.width / 2;
                    const startY = buttonRect.top + buttonRect.height / 2;
                    
                    const firstImage = imagesByProduct[product.id]?.[0]?.image_url;
                    
                    triggerAnimation({
                      imageUrl: firstImage,
                      productName: product.name,
                      startX,
                      startY,
                    });
                    
                    addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: firstImage }, 1);
                    
                    e.currentTarget.classList.add('animate-button-bounce');
                    setTimeout(() => {
                      e.currentTarget.classList.remove('animate-button-bounce');
                    }, 600);
                  }}
                  className="w-full mt-4 bg-dgreen text-cream px-6 py-3 rounded-lg font-medium hover:bg-lgreen cursor-pointer transition-transform active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredAndSortedProducts.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => goToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            className={`px-4 py-2 rounded-lg border cursor-pointer ${safeCurrentPage <= 1 ? 'text-gray-400 border-gray-200' : 'text-dgreen border-dgreen hover:bg-dgreen hover:text-white'}`}
          >
            Previous
          </button>
          <span className="text-dgray">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= totalPages}
            className={`px-4 py-2 rounded-lg border cursor-pointer ${safeCurrentPage >= totalPages ? 'text-gray-400 border-gray-200' : 'text-dgreen border-dgreen hover:bg-dgreen hover:text-white'}`}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default ProductGrid;