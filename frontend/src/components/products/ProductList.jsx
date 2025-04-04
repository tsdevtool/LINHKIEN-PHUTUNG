import { Button } from "antd";
import AddToCart from "../ui/AddToCart";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchHomeData } from "../../store/useHomeStore";

const ProductList = () => {
  const navigate = useNavigate();
  const {
    data: response,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Lấy mảng categories từ response
  const categories = response?.data || [];

  if (categories.length === 0) {
    return (
      <div className="text-center py-10">Không có danh mục sản phẩm nào.</div>
    );
  }

  const handleProductClick = (productId, e) => {
    // Nếu click vào nút AddToCart thì không chuyển trang
    if (e.target.closest('.add-to-cart-button')) {
      return;
    }
    navigate(`/product-info/${productId}`);
  };

  return (
    <div>
      {categories.map((category) => (
        <section
          key={category.id}
          id={category.name}
          className="my-8 max-w-7xl mx-auto px-6 py-6 font-primary bg-white dark:bg-gray-900 rounded-2xl"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
              {category.name}
            </h1>
            <Button onClick={() => navigate(`/category/${category.id}`)}>Xem thêm</Button>
          </div>

          {category.products && category.products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-8">
              {category.products.map((product) => (
                <div
                  key={product.id}
                  onClick={(e) => handleProductClick(product.id, e)}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out transform hover:-translate-y-2.5 hover:shadow-xl justify-between cursor-pointer"
                >
                  <div>
                    {product?.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-4 line-clamp-2">
                      {product.name}
                    </h2>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-semibold text-gray-800 dark:text-white">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </span>
                    <div className="add-to-cart-button">
                      <AddToCart product={product} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              Không có sản phẩm nào trong danh mục này.
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default ProductList;
