
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const categories = ['All', 'Seating', 'Storage', 'Tables', 'Beds'];

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
              selectedCategory === category
                ? 'bg-dgreen text-cream shadow-lg'
                : 'bg-cream text-dgreen border-2 border-lgreen hover:bg-lgreen hover:text-cream'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
