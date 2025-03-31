import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    price: {
      type: String,  // Chuyển sang kiểu String cho trường 'price' như trong ảnh
      required: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',  // Liên kết với model Category
      required: true
    },
    manufactured_at: {
      type: Date,
      required: true
    },
    expires_at: {
      type: Date,
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    image_public_id: {
      type: String
    },
    images: {
      type: [String],
      default: []
    },
    is_active: {
      type: Boolean,
      default: true
    },
    deleted_at: { 
      type: Date
    }
  },
  {
    timestamps: true  // Tự động tạo created_at và updated_at
  }
);
// Export mô hình Product
export const Product = mongoose.model('Product', productSchema);
