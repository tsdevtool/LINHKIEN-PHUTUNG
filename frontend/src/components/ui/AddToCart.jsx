import { CirclePlus, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../../store/Cart/useCartStore";
import PropTypes from "prop-types";

const AddToCart = ({ product }) => {
  const [clicked, setClicked] = useState(false);
  const { addToCart, isLoading } = useCartStore();

  const handleCartClick = async () => {
    if (isLoading) return;
    
    try {
      await addToCart(product.id, 1);
      setClicked(true);
      setTimeout(() => {
        setClicked(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setClicked(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCartClick}
        disabled={isLoading}
        className={`cart-button relative px-2 py-5 w-12 h-7 border-0 rounded-md bg-cyan-400 outline-none cursor-pointer text-white transition ease-in-out duration-300 overflow-hidden font-bold hover:bg-cyan-500 active:scale-90 ${
          clicked ? "clicked bg-green-500" : ""
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="absolute z-30 left-1/2 top-1/2 text-lg text-white transform -translate-x-1/2 -translate-y-1/2 add-to-cart opacity-100">
          {clicked ? <Check className="text-white" /> : <CirclePlus />}
        </span>
        {/* Shopping cart */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6 fa-solid cart-shopping-svg absolute z-20 top-1/2 left-[-30%] text-2xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{ x: clicked ? 35 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </motion.svg>

        {/* box */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ fill: "rgb(255, 167, 4)" }}
          viewBox="0 0 448 512"
          className="size-5 fas cart-box-svg absolute z-10 top-[-40%] left-[52%] text-xl transform -translate-x-1/2 -translate-y-1/2 "
          animate={{ y: clicked ? 30 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <path d="M50.7 58.5L0 160l208 0 0-128L93.7 32C75.5 32 58.9 42.3 50.7 58.5zM240 160l208 0L397.3 58.5C389.1 42.3 372.5 32 354.3 32L240 32l0 128zm208 32L0 192 0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-224z" />
        </motion.svg>
      </button>
    </>
  );
};

AddToCart.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    // Add other product properties if needed
  }).isRequired,
};

export default AddToCart;
