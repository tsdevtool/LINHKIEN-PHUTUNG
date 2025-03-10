import PropTypes from "prop-types";

const SearchInput = ({ onSearch }) => {
  return (
    <input
      id="category-search"
      type="text"
      className="w-full max-w-[300px] px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      placeholder="Tìm kiếm danh mục..."
      onChange={(e) => onSearch(e.target.value)}
    />
  );
};

SearchInput.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchInput;
