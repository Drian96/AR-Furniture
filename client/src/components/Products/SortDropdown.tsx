
interface SortDropdownProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const SortDropdown = ({ sortBy, onSortChange }: SortDropdownProps) => {
  const sortOptions = ['Most Relevant', 'Lowest Price', 'Highest Price', 'Newest'];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-dgray mb-2">
        Sort by:
      </label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-cream border-2 border-lgreen text-dgreen px-4 py-2 rounded-lg focus:outline-none focus:border-dgreen transition-colors cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
