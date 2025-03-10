import { Form, Input, InputNumber, Upload, Button, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const ProductForm = ({ initialData, onSubmit, categoryId }) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      const formData = new FormData();

      // Các trường bắt buộc
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("quantity", values.quantity.toString());
      formData.append("price", values.price.toString());
      formData.append("category_id", categoryId.toString());

      // Các trường không bắt buộc
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
      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      // Xử lý nhiều ảnh/video
      if (values.images?.length > 0) {
        values.images.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images[]", file.originFileObj);
          }
        });
      }

      // Log dữ liệu để debug
      console.log("Form Data:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      await onSubmit(formData);
      form.resetFields();
    } catch (error) {
      // Nếu có validation errors từ server
      if (error.response?.data?.message) {
        // Nếu message là object chứa các lỗi validation
        if (typeof error.response.data.message === "object") {
          Object.keys(error.response.data.message).forEach((field) => {
            form.setFields([
              {
                name: field,
                errors: [error.response.data.message[field][0]],
              },
            ]);
          });
        }
      }
      console.error("Form submission error:", error.response?.data);
    } finally {
      setSubmitLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
  };

  const multipleUploadProps = {
    beforeUpload: () => false,
    multiple: true,
    accept: "image/*,video/*",
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
    >
      <Form.Item
        name="name"
        label="Tên sản phẩm"
        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: "Vui lòng nhập mô tả sản phẩm" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Số lượng"
        rules={[
          { required: true, message: "Vui lòng nhập số lượng" },
          { type: "number", min: 0, message: "Số lượng không được âm" },
        ]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
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
        />
      </Form.Item>

      <Form.Item name="manufactured_at" label="Ngày sản xuất">
        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
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
        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
      </Form.Item>

      <Form.Item name="image" label="Ảnh chính">
        <Upload {...uploadProps} listType="picture">
          <Button icon={<UploadOutlined />}>Chọn ảnh chính</Button>
        </Upload>
      </Form.Item>

      <Form.Item name="images" label="Ảnh/Video khác">
        <Upload {...multipleUploadProps} listType="picture">
          <Button icon={<UploadOutlined />}>Thêm ảnh/video</Button>
        </Upload>
      </Form.Item>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="product"
          style={{ width: "100%", maxWidth: "200px", marginBottom: "16px" }}
        />
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitLoading}>
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
};

export default ProductForm;
