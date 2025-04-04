import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
    name: { type: String, required: true },
    parent_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    is_active: { type: Boolean, default: true },
    path: { type: String, default: null },
    parent_name: { type: String, default: null },
    level: { type: Number, default: 0 },
    created_at: { type: Date },
    updated_at: { type: Date },
    deleted_at: { type: Date }
}, { timestamps: false, versionKey: false, collection: "categories" });

// Middleware: Trước khi lưu, cập nhật `path`, `parent_name`, `level` nếu có `parent_id`
CategorySchema.pre('save', async function (next) {
    if (this.parent_id) {
        const parent = await this.constructor.findById(this.parent_id);
        if (parent) {
            this.path = parent.path ? `${parent.path}/${this._id}` : `${this._id}`;
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

// Middleware: Cập nhật `parent_name` cho tất cả con khi tên `Category` thay đổi
CategorySchema.post('findOneAndUpdate', async function (doc) {
    if (doc && doc.isModified('name')) {
        await doc.model('Category').updateMany(
            { parent_id: doc._id },
            { parent_name: doc.name }
        );
    }
});

// Virtual field để lấy tất cả `children`
CategorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent_id'
});

// Virtual field để lấy tất cả `descendants` (con cháu)
CategorySchema.virtual('descendants', {
    ref: 'Category',
    localField: 'path',
    foreignField: 'path',
    match: doc => ({ path: { $regex: `^${doc.path}/` } })
});

// Scope để lấy `categories` đang hoạt động
CategorySchema.statics.active = function () {
    return this.find({ is_active: true });
};

// Scope để lấy `categories` ở cấp gốc (level 0)
CategorySchema.statics.root = function () {
    return this.find({ parent_id: null });
};

// Thêm phương thức tùy chỉnh `moveTo` để di chuyển category sang `parent_id` mới
CategorySchema.methods.moveTo = async function (newParentId) {
    this.parent_id = newParentId;
    await this.save();

    const descendants = await this.model('Category').find({ path: { $regex: `^${this.path}/` } });
    for (let descendant of descendants) {
        await descendant.save();
    }
};

// Format dữ liệu trước khi trả về dưới dạng JSON
CategorySchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.deleted_at;
    delete obj.is_active;
    delete obj.path;
    return obj;
};

const Category = mongoose.model('Category', CategorySchema);
export default Category;
