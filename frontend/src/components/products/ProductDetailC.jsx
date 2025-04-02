import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import productDetailStore from "../../store/productDetailStore";
import { FaMinus, FaPlus, FaShoppingCart, FaStar, FaHeart, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {useCartStore} from "./../../store/Cart/useCartStore";

const ProductDetailC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  
  // Lấy dữ liệu sản phẩm
  const { data: product, error, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productDetailStore.getDetailProductbyID(id),
  });

  const [mainImage, setMainImage] = useState(null);
  const [thumbnailImages, setThumbnailImages] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // State cho hiệu ứng loading

  useEffect(() => {
    if (product) {
      setMainImage(product.image_url);
      setThumbnailImages(product.images || []);
      if (product.styles && product.styles.length > 0) {
        setSelectedStyle(product.styles[0]);
      }
    }
  }, [product]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10 text-center">
      <div className="text-red-500 text-xl">Đã xảy ra lỗi: {error.message}</div>
    </div>
  );
  
  if (!product) return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10 text-center">
      <div className="text-gray-600 text-xl">Không tìm thấy sản phẩm.</div>
    </div>
  );

  // Xử lý sự kiện khi click vào ảnh nhỏ
  const handleImageClick = (img, index) => {
    const newMainImage = img.url || img;
    const updatedThumbnails = [...thumbnailImages];
    updatedThumbnails[index] = mainImage;

    setThumbnailImages(updatedThumbnails);
    setMainImage(newMainImage);
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (amount) => {
    setItemQuantity((prevQuantity) => {
      let newQuantity = prevQuantity + amount;
      
      if (newQuantity < 1) return 1;
      if (newQuantity > product.quantity) return product.quantity;
      
      return newQuantity;
    });
  };

  // Xử lý thêm vào giỏ hàng với hiệu ứng loading
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true); // Bắt đầu hiệu ứng loading
      await addToCart(product.id, itemQuantity);
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau!");
    } finally {
      setIsAddingToCart(false); // Kết thúc hiệu ứng loading
    }
  };
  
  // Xử lý thêm vào yêu thích
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast(isFavorite ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích', {
      icon: isFavorite ? '💔' : '❤️',
    });
  };

  // Xử lý quay lại trang trước
  const handleGoBack = () => {
    navigate(-1);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { 
      style: "currency", 
      currency: "VND" 
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 bg-white rounded-xl shadow-lg mt-10 transition-all duration-300 hover:shadow-xl">
      {/* Nút quay lại */}
      <button 
          onClick={handleGoBack}
          className="flex items-center justify-center mb-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 text-gray-700 hover:scale-105"
        >
          <FaArrowLeft />
      </button>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cột hình ảnh sản phẩm */}
        <div className="lg:w-2/5">
          <div className="relative group">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-[500px] object-cover rounded-xl shadow-md transition-all duration-300 group-hover:shadow-xl hover:opacity-95"
            />
            <button 
              onClick={toggleFavorite}
              className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
            >
              <FaHeart 
                size={20} 
                className={isFavorite ? "text-red-500" : "text-gray-400"}
              />
            </button>
          </div>
          
          <div className="flex gap-3 mt-5 overflow-x-auto pb-2 scrollbar-hide">
            {thumbnailImages.length > 0 ? (
              thumbnailImages.map((img, index) => (
                <div
                  key={index}
                  className={`min-w-[100px] border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 ${
                    (img.url || img) === mainImage ? "border-yellow-500" : "border-gray-200"
                  }`}
                  onClick={() => handleImageClick(img, index)}
                >
                  <img
                    src={img.url || img}
                    alt={`Ảnh ${index + 1} của ${product.name}`}
                    className="w-full h-24 object-cover transition-all duration-300 hover:brightness-110"
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">Không có ảnh bổ sung</div>
            )}
          </div>
        </div>

        {/* Cột thông tin sản phẩm */}
        <div className="lg:w-3/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 transition-all duration-300 hover:text-gray-700">{product.name}</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="text-3xl font-bold text-red-600 transition-all duration-300 hover:text-red-700">
              {formatPrice(product.price)}
            </div>
            {product.original_price && (
              <div className="text-xl text-gray-500 line-through transition-all duration-300 hover:text-gray-600">
                {formatPrice(product.original_price)}
              </div>
            )}
            <div className="bg-red-100 text-red-600 px-4 py-1 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-red-200">
              Top sale
            </div>
          </div>

          <div className="border-t border-b py-6 my-6 transition-all duration-300 hover:bg-gray-50">
            <div className="mb-4 text-lg text-gray-700">
              <p className="leading-relaxed transition-all duration-300 hover:text-gray-900">{product.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Kiểu dáng:</h3>
            <div className="flex flex-wrap gap-3">
              {product.styles?.map((style, index) => (
                <button 
                  key={index} 
                  className={`px-5 py-3 border rounded-lg transition-all duration-300 hover:shadow-md ${
                    selectedStyle === style 
                      ? "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600" 
                      : "border-gray-300 hover:bg-gray-100 hover:-translate-y-1"
                  }`}
                  onClick={() => setSelectedStyle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-8 transition-all duration-300 hover:text-gray-900">
            <div className="text-gray-800 font-semibold">Trạng thái:</div>
            {product.quantity > 0 ? (
              <div className="text-green-600 font-semibold transition-all duration-300 hover:text-green-700">
                Còn hàng ({product.quantity} sản phẩm)
              </div>
            ) : (
              <div className="text-red-500 font-semibold transition-all duration-300 hover:text-red-600">Hết hàng</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Bộ điều khiển số lượng */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
              <button
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:text-gray-900"
                onClick={() => handleQuantityChange(-1)}
                disabled={itemQuantity <= 1}
              >
                <FaMinus size={14} />
              </button>
              <div className="w-16 text-center py-3 font-medium text-lg">
                {itemQuantity}
              </div>
              <button
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:text-gray-900"
                onClick={() => handleQuantityChange(1)}
                disabled={itemQuantity >= product.quantity}
              >
                <FaPlus size={14} />
              </button>
            </div>

            {/* Nút thêm vào giỏ hàng với hiệu ứng loading */}
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-1"
              disabled={product.quantity === 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Đang thêm...</span>
                </div>
              ) : (
                <>
                  <FaShoppingCart size={18} />
                  <span>Thêm Vào Giỏ Hàng</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md">
              <div className="font-semibold mb-2 text-base">Giao hàng nhanh</div>
              <div className="text-gray-600 text-base">Giao hàng miễn phí từ 2-3 ngày</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md">
              <div className="font-semibold mb-2 text-base">Bảo hành</div>
              <div className="text-gray-600 text-base">Bảo hành chính hãng 12 tháng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailC;