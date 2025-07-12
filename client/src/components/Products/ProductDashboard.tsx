
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import SortDropdown from './SortDropdown';
import { useState } from 'react';

const ProductDashboard = () => {
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
          {selectedCategory === 'All' ? 'All Products' : selectedCategory}
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
      />
    </div>
  );
};

export default ProductDashboard;
