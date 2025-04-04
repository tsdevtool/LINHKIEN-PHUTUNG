import { Search } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Search function
  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_PHP_URL}/api/client/search-products`, {
        params: { 
          name: query,
          limit: 10
        }
      });
      console.log('Search response:', response.data);
      const products = response.data.data || response.data.products || [];
      setSearchResults(products);
    } catch (error) {
      console.error('Search error:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchProducts(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchProducts]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(true);
  };

  const handleProductClick = (productId) => {
    navigate(`/product-info/${productId}`);
    setShowResults(false);
    setSearchTerm("");
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:max-w-xl search-container">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(true)}
          className="w-full px-4 py-2 border border-cyan-100 rounded-full text-sm shadow focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Bạn muốn tìm gì nè?"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-white p-2 rounded-full hover:bg-cyan-600 transition-colors cursor-pointer group">
          <Search 
            size={14} 
            className="group-hover:scale-110 transition-transform"
          />
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (searchResults.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <div className="mt-2">Đang tìm kiếm...</div>
            </div>
          ) : (
            <ul>
              {searchResults.map((product) => (
                <li 
                  key={product._id || product.id}
                  onClick={() => handleProductClick(product._id || product.id)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={product.image_url || product.imageUrl || '/placeholder.jpg'} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    <div>
                      <div className="font-medium text-gray-800 line-clamp-1">{product.name}</div>
                      <div className="text-cyan-600 text-sm font-semibold">
                        {product.price?.toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
