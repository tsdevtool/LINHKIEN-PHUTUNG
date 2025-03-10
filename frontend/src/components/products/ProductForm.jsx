import { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  DatePicker,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const ProductForm = ({ initialData, onSubmit, categoryId, isSubmitting }) => {
  const [form] = Form.useForm();
  const [mainImageList, setMainImageList] = useState(
    initialData?.image_url
      ? [
          {
            uid: "-1",
            name: "current-image",
            status: "done",
            url: initialData.image_url,
          },
        ]
      : []
  );
  const [additionalImages, setAdditionalImages] = useState(
    initialData?.images?.map((img, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: "done",
      url: img.url,
    })) || []
  );

  const handleImageChange = ({ fileList }) => {
    setMainImageList(fileList);
  };

  const handleAdditionalImagesChange = ({ fileList }) => {
    // Chỉ lưu các file hợp lệ
    const validFiles = fileList.filter(
      (file) =>
        file.status !== "error" &&
        (file.originFileObj instanceof File || file.url)
    );
    setAdditionalImages(validFiles);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Các trường bắt buộc
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("quantity", values.quantity.toString());
      formData.append("price", values.price.toString());
      formData.append("category_id", categoryId);

      // Các trường ngày tháng
      if (values.manufactured_at) {
        formData.append(
          "manufactured_at",
          values.manufactured_at.format("YYYY-MM-DD")
        );
      }
      if (values.expires_at) {
        formData.append("expires_at", values.expires_at.format("YYYY-MM-DD"));
      }

      // Xử lý ảnh chính
      const mainImage = mainImageList[0];
      if (mainImage?.originFileObj instanceof File) {
        formData.append("image", mainImage.originFileObj);
      }

      // Xử lý nhiều ảnh phụ
      if (additionalImages.length > 0) {
        additionalImages.forEach((file) => {
          if (file.originFileObj instanceof File) {
            formData.append("images[]", file.originFileObj);
          }
        });
      }

      await onSubmit(formData);
      form.resetFields();
      setMainImageList([]);
      setAdditionalImages([]);
      message.success(
        initialData ? "Cập nhật thành công" : "Thêm mới thành công"
      );
    } catch (error) {
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === "object") {
          Object.entries(error.response.data.message).forEach(
            ([field, messages]) => {
              form.setFields([
                {
                  name: field,
                  errors: [messages[0]],
                },
              ]);
            }
          );
        } else {
          message.error(error.response.data.message);
        }
      }
      console.error("Form submission error:", error.response?.data);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ có thể tải lên file ảnh!");
        return Upload.LIST_IGNORE;
      }
      return false; // Không tự động upload
    },
    maxCount: 1,
    accept: "image/*",
    onChange: handleImageChange,
    listType: "picture-card",
    fileList: mainImageList,
  };

  const multipleUploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ có thể tải lên file ảnh!");
        return Upload.LIST_IGNORE;
      }
      return false; // Không tự động upload
    },
    multiple: true,
    accept: "image/*",
    onChange: handleAdditionalImagesChange,
    listType: "picture-card",
    fileList: additionalImages,
  };

  const initialValues = initialData
    ? {
        ...initialData,
        manufactured_at: initialData.manufactured_at
          ? dayjs(initialData.manufactured_at)
          : null,
        expires_at: initialData.expires_at
          ? dayjs(initialData.expires_at)
          : null,
      }
    : undefined;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
      className="space-y-4"
    >
      <Form.Item
        name="name"
        label="Tên sản phẩm"
        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
      >
        <Input placeholder="Nhập tên sản phẩm" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: "Vui lòng nhập mô tả sản phẩm" }]}
      >
        <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng" },
            { type: "number", min: 0, message: "Số lượng không được âm" },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="Nhập số lượng"
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá"
          rules={[
            { required: true, message: "Vui lòng nhập giá" },
            { type: "number", min: 0, message: "Giá không được âm" },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            placeholder="Nhập giá"
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item name="manufactured_at" label="Ngày sản xuất">
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày sản xuất"
          />
        </Form.Item>

        <Form.Item
          name="expires_at"
          label="Ngày hết hạn"
          dependencies={["manufactured_at"]}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const manufactured = getFieldValue("manufactured_at");
                if (!value || !manufactured || value.isAfter(manufactured)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Ngày hết hạn phải sau ngày sản xuất")
                );
              },
            }),
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày hết hạn"
          />
        </Form.Item>
      </div>

      <Form.Item name="image" label="Ảnh chính">
        <Upload {...uploadProps}>
          {mainImageList.length === 0 && (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Tải lên ảnh chính</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item name="images" label="Ảnh phụ">
        <Upload {...multipleUploadProps}>
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Tải lên ảnh phụ</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          {initialData ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Form.Item>
    </Form>
  );
};

ProductForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  categoryId: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool,
};

ProductForm.defaultProps = {
  isSubmitting: false,
};

export default ProductForm;
