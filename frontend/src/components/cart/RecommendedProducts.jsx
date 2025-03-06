import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const RecommendedProducts = () => {
  // Dữ liệu mẫu cho sản phẩm đề xuất
  const recommendedProducts = [
    {
      id: 1,
      name: "Mainboard ASUS ROG STRIX B550-F GAMING",
      image: "https://picsum.photos/1600/900",
      price: 3890000,
      originalPrice: 4290000,
      discount: 9,
    },
    {
      id: 2,
      name: "Nguồn máy tính Corsair RM750x 80 Plus Gold",
      image: "https://picsum.photos/1600/900",
      price: 2790000,
      originalPrice: 3190000,
      discount: 12,
    },
    {
      id: 3,
      name: "Tản nhiệt nước AIO NZXT Kraken X63",
      image: "https://picsum.photos/1600/900",
      price: 3590000,
      originalPrice: 3990000,
      discount: 10,
    },
    {
      id: 4,
      name: "Vỏ case máy tính Lian Li O11 Dynamic",
      image: "https://picsum.photos/1600/900",
      price: 2990000,
      originalPrice: 3290000,
      discount: 9,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6 mt-6 animate-[fadeIn_0.3s_ease_forwards]">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Sản phẩm đề xuất
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendedProducts.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="group"
          >
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-all hover:shadow-md hover:-translate-y-1 duration-200 bg-white dark:bg-gray-800">
              <div className="relative mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-contain"
                />
                <span className="absolute top-2 left-2 bg-amber-300 text-black dark:text-white text-xs px-2 py-1 rounded">
                  -{product.discount}%
                </span>
              </div>

              <h3 className="font-medium text-gray-800 dark:text-white mb-2 line-clamp-2 h-12 group-hover:text-cyan-600 transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-cyan-600 font-bold">
                    {product.price.toLocaleString()}đ
                  </div>
                  <div className="text-gray-400 text-sm line-through">
                    {product.originalPrice.toLocaleString()}đ
                  </div>
                </div>

                <button className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
