import { useEffect, useRef, useState } from "react";
import { useCategoryStore } from "../store/useCategoryStore";
import { useProductStore } from "../store/useProductStore";
import $ from "jquery";
import "jstree/dist/themes/default/style.min.css";
import "jstree";
import { Modal } from "antd";
import ProductForm from "./ProductForm";
import { toast } from "react-hot-toast";

const CategoryTree = () => {
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
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'

  useEffect(() => {
    getAllCategories();
    getAllProducts();
  }, []);

  useEffect(() => {
    if (
      !categoryLoading &&
      !productLoading &&
      categories.length > 0 &&
      treeRef.current
    ) {
      let treeData = [];

      // Thêm các danh mục cha
      categories.forEach((category) => {
        if (!category.parent_id) {
          treeData.push({
            id: category.id,
            text: category.name,
            parent: "#",
            type: "parent_category",
            original: category,
          });

          // Thêm các danh mục con
          if (category.categories && category.categories.length > 0) {
            category.categories.forEach((child) => {
              treeData.push({
                id: child.id,
                text: child.name,
                parent: category.id,
                type: "child_category",
                original: child,
              });

              // Thêm các sản phẩm của danh mục con
              const childProducts = products.filter(
                (p) => p.category_id === child.id
              );
              childProducts.forEach((product) => {
                treeData.push({
                  id: `prod_${product.id}`,
                  text: product.name,
                  parent: child.id,
                  type: "product",
                  original: product,
                });
              });
            });
          }
        }
      });

      const $tree = $(treeRef.current);

      $tree.on("ready.jstree", function () {
        $tree.jstree("open_all");
      });

      $tree.on("move_node.jstree", async function (e, data) {
        const nodeType = data.node.type;
        const nodeId =
          nodeType === "product" ? data.node.id.split("_")[1] : data.node.id;
        const newParentId = data.parent === "#" ? null : data.parent;

        try {
          if (nodeType === "product") {
            // Khi di chuyển sản phẩm, newParentId chính là ID của category, không cần xử lý thêm
            await moveProduct(nodeId, newParentId);
          } else if (nodeType === "child_category") {
            await updateCategory(nodeId, { parent_id: newParentId });
          }
          toast.success("Di chuyển thành công");
        } catch (error) {
          console.error("Lỗi khi di chuyển:", error);
          toast.error("Không thể di chuyển. Vui lòng thử lại.");
          // Refresh lại tree để khôi phục vị trí cũ
          $tree.jstree(true).refresh();
        }
      });

      $tree.on("rename_node.jstree", async function (e, data) {
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

      $tree.on("create_node.jstree", async function (e, data) {
        const parentId = data.parent === "#" ? null : data.parent;
        const response = await addCategory({
          name: data.node.text,
          parent_id: parentId,
        });
        $tree.jstree(true).set_id(data.node, response.data.id);
      });

      $tree.jstree({
        core: {
          animation: 0,
          check_callback: true,
          themes: {
            name: "default",
            dots: true,
            icons: true,
            stripes: true,
          },
          data: treeData,
        },
        types: {
          parent_category: {
            icon: "fa fa-folder",
          },
          child_category: {
            icon: "fa fa-folder-open",
          },
          product: {
            icon: "fa fa-cube",
          },
        },
        plugins: ["contextmenu", "dnd", "search", "state", "types", "wholerow"],
        contextmenu: {
          items: function (node) {
            let items = {};

            if (node.type === "parent_category") {
              items.create = {
                label: "Thêm danh mục con",
                action: function () {
                  const inst = $.jstree.reference(node);
                  const newNode = inst.create_node(node, {
                    type: "child_category",
                    text: "Danh mục mới",
                  });
                  if (newNode) {
                    inst.edit(newNode);
                  }
                },
              };
            }

            if (node.type === "child_category") {
              items.create_product = {
                label: "Thêm sản phẩm mới",
                action: function () {
                  setSelectedCategory(node.original);
                  setModalMode("create");
                  setShowProductModal(true);
                },
              };
            }

            if (node.type === "product") {
              items.edit = {
                label: "Sửa sản phẩm",
                action: function () {
                  setSelectedProduct(node.original);
                  setModalMode("edit");
                  setShowProductModal(true);
                },
              };
            }

            items.rename = {
              label: "Đổi tên",
              action: function () {
                const inst = $.jstree.reference(node);
                inst.edit(node);
              },
            };

            if (node.type !== "parent_category" || !node.children.length) {
              items.delete = {
                label: "Xóa",
                action: async function () {
                  if (confirm("Bạn có chắc chắn muốn xóa?")) {
                    const inst = $.jstree.reference(node);
                    const nodeId =
                      node.type === "product" ? node.id.split("_")[1] : node.id;

                    try {
                      if (node.type === "product") {
                        await deleteProduct(nodeId);
                        inst.delete_node(node);
                      } else {
                        await softDeleteCategory(nodeId);
                        inst.delete_node(node);
                      }
                    } catch (error) {
                      console.error("Lỗi khi xóa:", error);
                    }
                  }
                },
              };
            }

            return items;
          },
        },
      });

      // Xử lý tìm kiếm
      const $search = $("#category-search");
      $search.keyup(function () {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(function () {
          const v = $search.val();
          $tree.jstree(true).search(v);
        }, 250);
      });
    }

    return () => {
      if (treeRef.current) {
        $(treeRef.current).jstree("destroy");
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [categories, products, categoryLoading, productLoading]);

  const handleProductSubmit = async (productData) => {
    try {
      if (modalMode === "create") {
        // Log dữ liệu trước khi gửi
        console.log("Category ID:", selectedCategory.id);
        console.log("Product Data:", productData);

        // Đảm bảo category_id là string
        const formData = new FormData();
        formData.append("name", productData.get("name"));
        formData.append("description", productData.get("description"));
        formData.append("quantity", productData.get("quantity"));
        formData.append("price", productData.get("price"));
        formData.append("category_id", selectedCategory.id.toString());

        // Thêm các trường không bắt buộc
        const manufactured_at = productData.get("manufactured_at");
        const expires_at = productData.get("expires_at");
        if (manufactured_at)
          formData.append("manufactured_at", manufactured_at);
        if (expires_at) formData.append("expires_at", expires_at);

        // Xử lý file
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
    } catch (error) {
      console.error("Error submitting product:", error);
      // Hiển thị lỗi validation nếu có
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
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <input
          id="category-search"
          type="text"
          className="form-control"
          placeholder="Tìm kiếm..."
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            width: "100%",
            maxWidth: "300px",
          }}
        />
      </div>
      <div ref={treeRef}></div>

      <Modal
        title={modalMode === "create" ? "Thêm sản phẩm mới" : "Sửa sản phẩm"}
        open={showProductModal}
        onCancel={() => setShowProductModal(false)}
        footer={null}
      >
        <ProductForm
          initialData={modalMode === "edit" ? selectedProduct : null}
          onSubmit={handleProductSubmit}
          categoryId={selectedCategory?.id}
        />
      </Modal>
    </div>
  );
};

export default CategoryTree;
