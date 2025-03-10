import { useEffect, useRef, useState } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import $ from "jquery";
import "jstree/dist/themes/default/style.min.css";
import "jstree";
import { Modal } from "antd";
import { toast } from "react-hot-toast";
import SearchInput from "./components/SearchInput";
import { getTreeConfig, transformData } from "./config/treeConfig";
import { getContextMenuItems } from "./config/contextMenuConfig";
import ProductForm from "@/components/ProductForm";
import { Folder, FolderOpen, Package2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

const StatCard = ({ icon, title, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.02 }}
    className={`bg-${color}-50 rounded-lg p-4 flex items-center gap-3 transform transition-all duration-300 hover:shadow-md`}
  >
    <div
      className={`bg-${color}-500/10 p-3 rounded-lg transition-colors duration-300`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <motion.p
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        className="text-xl font-semibold text-gray-900"
      >
        {value}
      </motion.p>
    </div>
  </motion.div>
);

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.oneOf(["blue", "purple", "green"]).isRequired,
};

const CategoriesTreeSection = () => {
  const {
    categories,
    getAllCategories,
    isLoading: categoryLoading,
    addCategory,
    updateCategory,
    softDeleteCategory,
  } = useCategoryStore();

  const {
    products,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    moveProduct,
    isLoading: productLoading,
  } = useProductStore();

  const treeRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  useEffect(() => {
    getAllCategories();
    getAllProducts();
  }, [getAllCategories, getAllProducts]);

  useEffect(() => {
    if (
      !categoryLoading &&
      !productLoading &&
      categories.length > 0 &&
      treeRef.current
    ) {
      const treeData = transformData(categories, products);
      const $tree = $(treeRef.current);

      // Khởi tạo các sự kiện
      $tree.on("ready.jstree", () => $tree.jstree("open_all"));

      $tree.on("move_node.jstree", async (e, data) => {
        try {
          const nodeType = data.node.type;
          const nodeId =
            nodeType === "product" ? data.node.id.split("_")[1] : data.node.id;
          const newParentId = data.parent === "#" ? null : data.parent;

          if (nodeType === "product") {
            await moveProduct(nodeId, newParentId);
          } else if (nodeType === "child_category") {
            await updateCategory(nodeId, { parent_id: newParentId });
          }
          toast.success("Di chuyển thành công");
        } catch (error) {
          console.error("Lỗi khi di chuyển:", error);
          toast.error("Không thể di chuyển. Vui lòng thử lại.");
          $tree.jstree(true).refresh();
        }
      });

      $tree.on("rename_node.jstree", async (e, data) => {
        const nodeType = data.node.type;
        const nodeId =
          nodeType === "product" ? data.node.id.split("_")[1] : data.node.id;
        const newName = data.text;

        if (nodeType === "product") {
          await updateProduct(nodeId, { name: newName });
        } else {
          await updateCategory(nodeId, { name: newName });
        }
      });

      $tree.on("create_node.jstree", async (e, data) => {
        const parentId = data.parent === "#" ? null : data.parent;
        const response = await addCategory({
          name: data.node.text,
          parent_id: parentId,
        });
        $tree.jstree(true).set_id(data.node, response.data.id);
      });

      // Khởi tạo jsTree
      $tree.jstree({
        ...getTreeConfig(treeData),
        contextmenu: {
          items: (node) =>
            getContextMenuItems({
              node,
              setSelectedCategory,
              setSelectedProduct,
              setModalMode,
              setShowProductModal,
              deleteProduct,
              softDeleteCategory,
            }),
        },
      });

      return () => {
        $tree.jstree("destroy");
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }
  }, [categories, products, categoryLoading, productLoading]);

  const handleSearch = (value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      $(treeRef.current).jstree(true).search(value);
    }, 250);
  };

  const handleProductSubmit = async (productData) => {
    try {
      if (modalMode === "create") {
        const formData = new FormData();
        formData.append("name", productData.get("name"));
        formData.append("description", productData.get("description"));
        formData.append("quantity", productData.get("quantity"));
        formData.append("price", productData.get("price"));
        formData.append("category_id", selectedCategory.id.toString());

        const manufactured_at = productData.get("manufactured_at");
        const expires_at = productData.get("expires_at");
        if (manufactured_at)
          formData.append("manufactured_at", manufactured_at);
        if (expires_at) formData.append("expires_at", expires_at);

        const image = productData.get("image");
        if (image) formData.append("image", image);

        const images = productData.getAll("images[]");
        if (images.length > 0) {
          images.forEach((img) => formData.append("images[]", img));
        }

        await createProduct(formData);
      } else {
        await updateProduct(selectedProduct.id, productData);
      }
      setShowProductModal(false);
      getAllProducts();
      toast.success(
        modalMode === "create"
          ? "Thêm sản phẩm thành công"
          : "Cập nhật sản phẩm thành công"
      );
    } catch (error) {
      console.error("Error submitting product:", error);
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === "object") {
          Object.entries(error.response.data.message).forEach(
            ([field, messages]) => {
              toast.error(`${field}: ${messages[0]}`);
            }
          );
        } else {
          toast.error(error.response.data.message);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-sm p-6 space-y-6"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4"
      >
        <div>
          <motion.h2
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-2xl font-bold text-gray-800"
          >
            Sơ đồ danh mục
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 mt-1"
          >
            Quản lý cấu trúc danh mục và sản phẩm
          </motion.p>
        </div>
        <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <SearchInput onSearch={handleSearch} />
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Folder className="w-6 h-6 text-blue-600" />}
          title="Danh mục cha"
          value={categories.filter((c) => !c.parent_id).length}
          color="blue"
        />
        <StatCard
          icon={<FolderOpen className="w-6 h-6 text-purple-600" />}
          title="Danh mục con"
          value={categories.reduce(
            (count, cat) => count + (cat.categories?.length || 0),
            0
          )}
          color="purple"
        />
        <StatCard
          icon={<Package2 className="w-6 h-6 text-green-600" />}
          title="Tổng sản phẩm"
          value={products.length}
          color="green"
        />
      </div>

      {/* Tree Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <motion.div
          whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
          className="bg-gray-100 px-6 py-3 border-b border-gray-200"
        >
          <h3 className="font-medium text-gray-700">Cấu trúc danh mục</h3>
        </motion.div>
        <div
          ref={treeRef}
          className="p-6 min-h-[500px] transition-all duration-300"
          style={{
            "--jstree-border": "none",
            "--jstree-wholerow-hovered-bg": "rgba(59, 130, 246, 0.1)",
            "--jstree-wholerow-clicked-bg": "rgba(59, 130, 246, 0.2)",
          }}
        />
      </motion.div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <Modal
            title={
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="flex items-center gap-2 py-2"
              >
                <Package2 className="w-5 h-5 text-blue-500" />
                <span className="font-medium">
                  {modalMode === "create"
                    ? "Thêm sản phẩm mới"
                    : "Sửa sản phẩm"}
                </span>
              </motion.div>
            }
            open={showProductModal}
            onCancel={() => setShowProductModal(false)}
            footer={null}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProductForm
                initialData={modalMode === "edit" ? selectedProduct : null}
                onSubmit={handleProductSubmit}
                categoryId={selectedCategory?.id}
              />
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategoriesTreeSection;
