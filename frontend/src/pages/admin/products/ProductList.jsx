import Loading from "@/components/ui/Loading";
import { useProductStore } from "@/store/useProductStore";
import { useCallback, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import ProductCardSkeleton from "./components/ProductCardSkeleton";

const ProductList = () => {
  const { products, isLoadingProduct, getAllProducts } = useProductStore();

  const fetchProducts = useCallback(() => {
    getAllProducts();
  }, [getAllProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  console.log(products);

  return (
    <div className="w-full flex flex-col items-center gap-4  ">
      <div className="flex flex-col w-full shadow-xl shadow-gray-300 rounded-4xl px-12 py-6">
        <h1 className="text-3xl font-bold mb-3">Danh sách sản phẩm</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center gap-4">
          {isLoadingProduct ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-4">
              Không có sản phẩm nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
