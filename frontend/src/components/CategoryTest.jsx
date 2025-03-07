import { useEffect, useState } from "react";
import { useCategoryStore } from "../store/useCategoryStore";
import {
  Button,
  Input,
  Space,
  Table,
  Modal,
  Form,
  Select,
  message,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { confirm } = Modal;

const CategoryTest = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showTrashed, setShowTrashed] = useState(false);

  const {
    categories,
    trashedCategories,
    isLoading,
    getAllCategories,
    getTrashedCategories,
    addCategory,
    updateCategory,
    softDeleteCategory,
    restoreCategory,
    forceDeleteCategory,
  } = useCategoryStore();

  useEffect(() => {
    getAllCategories();
  }, []);

  // Chỉ lấy danh sách đã xóa khi cần thiết
  useEffect(() => {
    if (showTrashed) {
      getTrashedCategories();
    }
  }, [showTrashed]);

  const showDeleteConfirm = (category) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa danh mục này?",
      icon: <ExclamationCircleOutlined />,
      content: "Danh mục sẽ được chuyển vào thùng rác",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        softDeleteCategory(category.id);
      },
    });
  };

  const showForceDeleteConfirm = (category) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa vĩnh viễn danh mục này?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác",
      okText: "Xóa vĩnh viễn",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        forceDeleteCategory(category.id);
      },
    });
  };

  const handleAddOrUpdate = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
      } else {
        await addCategory(values);
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Danh mục cha",
      dataIndex: "parent_name",
      key: "parent_name",
      render: (text, record) => record.parent?.name || "Không có",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          {!showTrashed ? (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingCategory(record);
                  form.setFieldsValue({
                    name: record.name,
                    parent_id: record.parent_id,
                  });
                  setIsModalVisible(true);
                }}
              >
                Sửa
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record)}
              >
                Xóa
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                icon={<UndoOutlined />}
                onClick={() => restoreCategory(record.id)}
              >
                Khôi phục
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showForceDeleteConfirm(record)}
              >
                Xóa vĩnh viễn
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const currentData = showTrashed ? trashedCategories : categories;
  const emptyText = showTrashed
    ? "Không có danh mục nào trong thùng rác"
    : "Chưa có danh mục nào được tạo";

  // Lọc ra các danh mục có thể chọn làm cha (không bao gồm danh mục đang sửa)
  const parentOptions = categories
    .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
    .map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));

  return (
    <div style={{ padding: "20px" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm danh mục mới
        </Button>
        <Button onClick={() => setShowTrashed(!showTrashed)}>
          {showTrashed ? "Xem danh mục đang hoạt động" : "Xem thùng rác"}
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={currentData}
        loading={isLoading}
        rowKey="id"
        locale={{
          emptyText: <Empty description={emptyText} />,
        }}
      />

      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="parent_id" label="Danh mục cha">
            <Select
              allowClear
              placeholder="Chọn danh mục cha"
              options={parentOptions}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingCategory(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryTest;
