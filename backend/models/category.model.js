import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    parent_name: { type: String, default: null },
    level: { type: Number, default: 0 },
    path: { type: String },
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Middleware: Cập nhật path, parent_name và level trước khi lưu
categorySchema.pre("save", async function (next) {
  if (this.parent_id) {
    const parent = await mongoose.model("Category").findById(this.parent_id);
    if (parent) {
      this.path = `${parent.path}/${this._id}`;
      this.parent_name = parent.name;
      this.level = 1;
    }
  } else {
    this.path = this._id.toString();
    this.parent_name = null;
    this.level = 0;
  }
  next();
});

// Khi category cha thay đổi tên, cập nhật parent_name cho tất cả category con
categorySchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await mongoose.model("Category").updateMany(
      { parent_id: doc._id },
      { parent_name: doc.name }
    );
  }
});

// Lấy danh mục cha
categorySchema.virtual("parent", {
  ref: "Category",
  localField: "parent_id",
  foreignField: "_id",
  justOne: true,
});

// Lấy danh mục con
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent_id",
});

// Lấy tất cả danh mục con
categorySchema.statics.findDescendants = async function (categoryId) {
  return this.find({ path: new RegExp(`^${categoryId}/`) });
};

// Di chuyển danh mục
categorySchema.methods.moveTo = async function (newParentId) {
  this.parent_id = newParentId;
  await this.save();
  await this.constructor.findDescendants(this._id).then(async (descendants) => {
    for (const descendant of descendants) {
      await descendant.save();
    }
  });
};

// Lọc danh mục đang hoạt động
categorySchema.statics.findActive = function () {
  return this.find({ is_active: true });
};

// Lọc danh mục gốc
categorySchema.statics.findRootCategories = function () {
  return this.find({ parent_id: null });
};

const Category = mongoose.model("categories", categorySchema);
export default Category;