import { useCategoryStore } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import CSS

const ProductCard = ({ product, onEdit }) => {
  const { categories, isLoading } = useCategoryStore();
  const { deleteProduct } = useProductStore();

  // Lấy danh mục từ categories bằng category_id của sản phẩm
  const category = categories?.find((cat) => cat.id === product.category_id);

  const handleDelete = async () => {
    confirmAlert({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      buttons: [
        {
          label: "Có",
          onClick: async () => {
            try {
              await deleteProduct(product.id);
              console.log("Sản phẩm đã được xóa thành công");
            } catch (error) {
              console.error("Lỗi khi xóa sản phẩm:", error);
            }
          },
        },
        {
          label: "Không",
          onClick: () => console.log("Hủy xóa sản phẩm"),
        },
      ],
    });
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-4 transform hover:scale-105 transition-all duration-300 flex flex-col h-full relative z-10">
      <a
        href={`/products/${product.id}`}
        className="block relative overflow-hidden rounded-xl"
      >
        <img
          src={product.image_url ? product.image_url : 'path/to/default/image.jpg'}
          alt={product.name}
          className="w-full h-40 object-cover rounded-xl"
        />
      </a>
      <div className="mt-3 flex flex-col flex-grow">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            <Link
              to={`/products/${product.id}`}
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
          <div className="flex justify-between mt-4">
            <button
              onClick={() => onEdit(product)}
              className="bg-yellow-500 text-white px-4 py-2 rounded relative z-20"
            >
              Sửa
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded relative z-20"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;