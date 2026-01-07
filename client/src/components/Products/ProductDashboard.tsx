import React, { useState } from 'react';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import SortDropdown from './SortDropdown';

export interface ProductDashboardProps {
  searchQuery?: string;
  initialPage?: number;
}

const ProductDashboard: React.FC<ProductDashboardProps> = ({ searchQuery = '', initialPage = 1 }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Most Relevant');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Categories */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      {/* Sort Dropdown */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-dgreen">
          {searchQuery.trim() 
            ? `Search Results for "${searchQuery}"` 
            : selectedCategory === 'All' 
              ? 'All Products' 
              : selectedCategory
          }
        </h2>
        <SortDropdown 
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>
      
      {/* Products Grid */}
      <ProductGrid 
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        searchQuery={searchQuery}
        initialPage={initialPage}
      />
    </div>
  );
};

export default ProductDashboard;