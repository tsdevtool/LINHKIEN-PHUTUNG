import $ from "jquery";
import { Modal } from "antd";

export const getContextMenuItems = ({
  node,
  setSelectedCategory,
  setSelectedProduct,
  setModalMode,
  setShowProductModal,
  deleteProduct,
  softDeleteCategory,
  handleAddProduct,
  handleEditProduct,
}) => {
  const items = {};

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
    items.addProduct = {
      label: "Thêm sản phẩm mới",
      icon: "fa fa-plus",
      action: () => handleAddProduct(node),
    };
  }

  if (node.type === "product") {
    items.edit = {
      label: "Sửa sản phẩm",
      icon: "fa fa-edit",
      action: () => handleEditProduct(node),
    };
    items.delete = {
      label: "Xóa sản phẩm",
      icon: "fa fa-trash",
      action: () => {
        const productId = node.id.split("_")[1];
        Modal.confirm({
          title: "Xác nhận xóa",
          content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
          okText: "Xóa",
          okType: "danger",
          cancelText: "Hủy",
          onOk: () => deleteProduct(productId),
        });
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
            } else {
              await softDeleteCategory(nodeId);
            }
            inst.delete_node(node);
          } catch (error) {
            console.error("Lỗi khi xóa:", error);
          }
        }
      },
    };
  }

  return items;
};
