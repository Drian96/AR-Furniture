
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import sofa from '../../assets/sofa.jpg'

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  isNew: boolean;
}

interface ProductGridProps {
  selectedCategory: string;
  sortBy: string;
}

const ProductGrid = ({ selectedCategory, sortBy }: ProductGridProps) => {
  const products: Product[] = [
    {
      id: 1,
      name: "Modern Oak Dining Table",
      price: 1299,
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Tables",
      isNew: true
    },
    {
      id: 2,
      name: "Comfort Lounge Chair",
      price: 899,
      image: sofa,
      category: "Seating",
      isNew: false
    },
    {
      id: 3,
      name: "Minimalist Bookshelf",
      price: 649,
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Storage",
      isNew: true
    },
    {
      id: 4,
      name: "Elegant Coffee Table",
      price: 449,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Tables",
      isNew: false
    },
    {
      id: 5,
      name: "King Size Platform Bed",
      price: 1599,
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Beds",
      isNew: true
    },
    {
      id: 6,
      name: "Velvet Armchair",
      price: 799,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Seating",
      isNew: false
    },
    {
      id: 7,
      name: "Wooden Storage Cabinet",
      price: 599,
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Storage",
      isNew: false
    },
    {
      id: 8,
      name: "Queen Size Upholstered Bed",
      price: 1299,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Beds",
      isNew: true
    }
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory === 'All' 
      ? products 
      : products.filter(product => product.category === selectedCategory);

    switch (sortBy) {
      case 'Lowest Price':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'Highest Price':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'Newest':
        return [...filtered].sort((a, b) => Number(b.isNew) - Number(a.isNew));
      default:
        return filtered;
    }
  }, [selectedCategory, sortBy]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filteredAndSortedProducts.map((product) => (
        <div key={product.id} className="group cursor-pointer">
          <Link to={`/product/${product.id}`}>
            <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
              <img 
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              {product.isNew && (
                <div className="absolute top-4 left-4">
                  <span className="bg-dgreen text-cream px-3 py-1 rounded-full text-sm font-medium">
                    New
                  </span>
                </div>
              )}
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
                ${product.price.toLocaleString()}
              </p>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log(`Added ${product.name} to cart`);
                }}
                className="w-full mt-4 bg-dgreen text-cream px-6 py-3 rounded-lg font-medium hover:bg-lgreen transition-all duration-300"
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
