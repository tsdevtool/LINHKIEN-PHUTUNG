import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    parent_name: {
      type: String,
      default: null
    },
    level: {
      type: Number,
      default: 0  // 0: Cha, 1: Con
    },
    path: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    is_active: {
      type: Boolean,
      default: true
    },
    deleted_at: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }  // Tự động tạo trường created_at và updated_at
);

// Export mô hình Category
export const Category = mongoose.model('Category', categorySchema);
