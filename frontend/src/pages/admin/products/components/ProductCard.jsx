import { useCategoryStore } from "@/store/useCategoryStore";
import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { categories, isLoading } = useCategoryStore();

  // Lấy danh mục từ categories bằng category_id của sản phẩm
  const category = categories?.find((cat) => cat.id === product.category_id);
  return (
    <div className="bg-white shadow-xl rounded-2xl p-4 transform hover:scale-105 transition-all duration-300 flex flex-col h-full -z-10">
      <a
        href={`/products/${product.id}`}
        className="block relative overflow-hidden rounded-xl"
      >
        <img
          src={`http://127.0.0.1:8000${product?.image_url}`}
          alt={product.name}
          className="w-full h-40 object-cover rounded-xl"
        />
      </a>
      <div className="mt-3 flex flex-col flex-grow">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            <Link
              href={`/products/${product.id}`}
              className="hover:text-blue-600"
            >
              {product.name}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm mt-1">{product.description}</p>
        </div>

        {/* Thêm flex-grow để đẩy phần này xuống dưới */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mt-3">
            <span className="text-blue-500 font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <span>Số lượng: {product.quantity}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>
                {isLoading ? "Đang tải..." : category?.name || "Danh mục?"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
