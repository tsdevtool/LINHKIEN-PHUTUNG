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

    </div>
  );
};

export default EmptyCart;
