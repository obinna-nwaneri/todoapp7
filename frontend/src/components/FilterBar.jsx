const FilterBar = ({ children, onSearch, searchValue, placeholder = "Search..." }) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <input
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full max-w-sm rounded border px-3 py-2"
        placeholder={placeholder}
      />
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
};

export default FilterBar;
