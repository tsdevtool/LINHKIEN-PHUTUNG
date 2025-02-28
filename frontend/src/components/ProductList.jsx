import AddToCart from "./ui/AddToCart";

const ProductList = () => {
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 299.99,
      image:
        "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience.",
      category: "Electronics",
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 149.99,
      image:
        "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Stay connected and track your fitness goals with a sleek, stylish smartwatch that blends functionality and elegance.",

      category: "Wearables",
    },
    {
      id: 3,
      name: "Bluetooth Tws",
      price: 129.99,
      image:
        "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Portable and powerful sound system with deep bass and crystal-clear highs. Perfect for parties and outdoor events.",

      category: "Audio",
    },
    {
      id: 4,
      name: "4K UHD Smart TV",
      price: 799.99,
      image:
        "https://images.pexels.com/photos/28549934/pexels-photo-28549934/free-photo-of-modern-home-living-room-with-smart-devices.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Enjoy your favorite content in stunning 4K resolution with vibrant colors and dynamic sound. Perfect for home entertainment.",

      category: "Electronics",
    },
    {
      id: 5,
      name: "Wireless Headphones",
      price: 299.99,
      image:
        "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience. Experience true wireless freedom with premium sound quality. Noise-cancelling technology for the best listening experience.",
      category: "Electronics",
    },
    {
      id: 6,
      name: "Smart Watch",
      price: 149.99,
      image:
        "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Stay connected and track your fitness goals with a sleek, stylish smartwatch that blends functionality and elegance.",

      category: "Wearables",
    },
    {
      id: 7,
      name: "Bluetooth Tws",
      price: 129.99,
      image:
        "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Portable and powerful sound system with deep bass and crystal-clear highs. Perfect for parties and outdoor events.",

      category: "Audio",
    },
    {
      id: 8,
      name: "4K UHD Smart TV",
      price: 799.99,
      image:
        "https://images.pexels.com/photos/28549934/pexels-photo-28549934/free-photo-of-modern-home-living-room-with-smart-devices.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Enjoy your favorite content in stunning 4K resolution with vibrant colors and dynamic sound. Perfect for home entertainment.",

      category: "Electronics",
    },
  ];
  return (
    <div>
      {/* Do choi xe may */}
      <section
        id="do-choi-xe-may"
        className="my-8 max-w-7xl mx-auto px-6 py-6 font-primary bg-white dark:bg-gray-900 rounded-2xl"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
          ĐỒ CHƠI XE MÁY
        </h1>
        <p className="mt-2 text-sm md:text-lg text-gray-600 dark:text-gray-300">
          Bạn là người yêu xe, đam mê độ xe và muốn chiếc xe của mình trở nên
          nổi bật hơn? Hãy khám phá ngay{" "}
          <span className="font-bold">Đồ chơi xe máy</span> bộ sưu tập tại
          MotorKing – nơi mang đến cho bạn những sản phẩm chất lượng cao, giúp
          bạn cá nhân hóa và nâng cấp chiếc xe theo phong cách riêng.
        </p>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out transform hover:-translate-y-2.5 hover:shadow-xl justify-between"
            >
              <div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-4">
                  {product.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-start text-xs md:text-base mt-2 line-clamp-4">
                  {product.description}
                </p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold text-gray-800 dark:text-white">
                  {product.price.toFixed(3)} {"VNĐ"}
                </span>
                <AddToCart />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Phụ tùng thay thế */}
      <section
        id="phu-tung-thay-the"
        className="my-8 max-w-7xl mx-auto px-6 py-6 font-primary bg-white dark:bg-gray-900 rounded-2xl"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
          ĐỒ CHƠI XE MÁY
        </h1>
        <p className="mt-2 text-sm md:text-lg text-gray-600 dark:text-gray-300">
          Bạn là người yêu xe, đam mê độ xe và muốn chiếc xe của mình trở nên
          nổi bật hơn? Hãy khám phá ngay{" "}
          <span className="font-bold">Đồ chơi xe máy</span> bộ sưu tập tại
          MotorKing – nơi mang đến cho bạn những sản phẩm chất lượng cao, giúp
          bạn cá nhân hóa và nâng cấp chiếc xe theo phong cách riêng.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 mt-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out transform hover:-translate-y-2.5 hover:shadow-xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-4">
                {product.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-start text-xs md:text-base mt-2 line-clamp-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold text-gray-800 dark:text-white">
                  {product.price.toFixed(3)} {"VNĐ"}
                </span>
                <AddToCart />
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Vỏ xe máy (lốp xe) */}
      <section
        id="vo-xe-may"
        className="my-8 max-w-7xl mx-auto px-6 py-6 font-primary bg-white dark:bg-gray-900 rounded-2xl"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
          ĐỒ CHƠI XE MÁY
        </h1>
        <p className="mt-2 text-sm md:text-lg text-gray-600 dark:text-gray-300">
          Bạn là người yêu xe, đam mê độ xe và muốn chiếc xe của mình trở nên
          nổi bật hơn? Hãy khám phá ngay{" "}
          <span className="font-bold">Đồ chơi xe máy</span> bộ sưu tập tại
          MotorKing – nơi mang đến cho bạn những sản phẩm chất lượng cao, giúp
          bạn cá nhân hóa và nâng cấp chiếc xe theo phong cách riêng.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 mt-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out transform hover:-translate-y-2.5 hover:shadow-xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-4">
                {product.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-start text-xs md:text-base mt-2 line-clamp-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold text-gray-800 dark:text-white">
                  {product.price.toFixed(3)} {"VNĐ"}
                </span>
                <AddToCart />
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Nhớt xe máy */}
      <section
        id="nhot-xe-may"
        className="my-8 max-w-7xl mx-auto px-6 py-6 font-primary bg-white dark:bg-gray-900 rounded-2xl"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
          ĐỒ CHƠI XE MÁY
        </h1>
        <p className="mt-2 text-sm md:text-lg text-gray-600 dark:text-gray-300">
          Bạn là người yêu xe, đam mê độ xe và muốn chiếc xe của mình trở nên
          nổi bật hơn? Hãy khám phá ngay{" "}
          <span className="font-bold">Đồ chơi xe máy</span> bộ sưu tập tại
          MotorKing – nơi mang đến cho bạn những sản phẩm chất lượng cao, giúp
          bạn cá nhân hóa và nâng cấp chiếc xe theo phong cách riêng.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 mt-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out transform hover:-translate-y-2.5 hover:shadow-xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-4">
                {product.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-start text-xs md:text-base mt-2 line-clamp-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold text-gray-800 dark:text-white">
                  {product.price.toFixed(3)} {"VNĐ"}
                </span>
                <AddToCart />
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Phụ tùng theo xe */}
      <section
        id="phu-tung-theo-xe"
        className="my-8 max-w-7xl mx-auto px-6 py-6 font-primary bg-white dark:bg-gray-900 rounded-2xl"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
          ĐỒ CHƠI XE MÁY
        </h1>
        <p className="mt-2 text-sm md:text-lg text-gray-600 dark:text-gray-300">
          Bạn là người yêu xe, đam mê độ xe và muốn chiếc xe của mình trở nên
          nổi bật hơn? Hãy khám phá ngay{" "}
          <span className="font-bold">Đồ chơi xe máy</span> bộ sưu tập tại
          MotorKing – nơi mang đến cho bạn những sản phẩm chất lượng cao, giúp
          bạn cá nhân hóa và nâng cấp chiếc xe theo phong cách riêng.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 mt-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out transform hover:-translate-y-2.5 hover:shadow-xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-4">
                {product.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-start text-xs md:text-base mt-2 line-clamp-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold text-gray-800 dark:text-white">
                  {product.price.toFixed(3)} {"VNĐ"}
                </span>
                <AddToCart />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductList;
