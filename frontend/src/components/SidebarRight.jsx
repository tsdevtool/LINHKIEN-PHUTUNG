import { motion } from "framer-motion";

const SidebarRight = () => {
  return (
    <div className="my-8 min-w-1/12 w-[260px] h-[200px] max-lg:hidden ml-6 mr-3 font-primary bg-gradient-to-r from-pink-200 to-cyan-500 dark:from-red-400 dark:to-yellow-500 text-white rounded-2xl flex flex-col shadow-gray-400 shadow-lg relative items-center justify-center overflow-hidden">
      {/* <DarkMode /> */}
      <motion.div
        className="whitespace-nowrap text-sm font-bold"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
      >
        🎉 KHAI TRƯƠNG MOTORKING - GIẢM GIÁ 50% - MUA NGAY 🚀🚀🚀
      </motion.div>
      <div className="text-center mt-3 p-3">
        <motion.h1
          className="text-md font-bold text-yellow-400"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          📅 01/03/2025 - 07/03/2025
        </motion.h1>
        <p className="text-sm text-gray-800 dark:text-white line-clamp-2">
          Đặt hàng ngay để nhận ưu đãi hấp dẫn từ MotorKing!
        </p>
      </div>
    </div>
  );
};

export default SidebarRight;
