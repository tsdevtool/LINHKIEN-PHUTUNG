import { Link } from "react-router-dom";
import { FaShoppingCart, FaArrowRight } from "react-icons/fa";

const EmptyCart = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-8 text-center animate-[fadeIn_0.3s_ease_forwards]">
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <FaShoppingCart className="text-gray-400 dark:text-gray-300 text-4xl" />
      </div>

      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
        Giỏ hàng của bạn đang trống
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm. Khám phá các sản
        phẩm linh kiện chất lượng của chúng tôi!
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors active:scale-[0.98] transform duration-100"
      >
        Tiếp tục mua sắm
        <FaArrowRight className="text-sm" />
      </Link>

      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h3 className="font-medium mb-6 text-gray-800 dark:text-white text-lg">
          Có thể bạn sẽ thích
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              name: "CPU Intel Core i5-12400F",
              price: "4.290.000đ",
              discount: "10%",
            },
            {
              name: "RAM Kingston Fury 16GB",
              price: "1.290.000đ",
              discount: "15%",
            },
            {
              name: "SSD Samsung 970 EVO 500GB",
              price: "1.890.000đ",
              discount: "8%",
            },
            {
              name: "VGA RTX 3060 Ti 8GB",
              price: "9.990.000đ",
              discount: "5%",
            },
          ].map((item, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-600">
                <div className="relative">
                  <div className="bg-gray-200 dark:bg-gray-600 w-full h-32 md:h-40"></div>
                  <div className="absolute top-2 left-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded">
                    -{item.discount}
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="font-medium text-gray-800 dark:text-white text-sm mb-2 line-clamp-2 h-10 group-hover:text-cyan-600 transition-colors">
                    {item.name}
                  </h4>
                  <div className="text-cyan-600 font-bold">{item.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
