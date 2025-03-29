import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
    {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        address: { type: String },
        image: { type: String },
        numberOfOrders: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0.0 },
        idrole: { type: String, ref: "Role" }, // Liên kết với bảng Role
        status: { type: Boolean, default: true },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now },
        deleted_at: { type: Date, default: null }
    },
    { versionKey: false ,collection: "users" }
);

// Ẩn trường mật khẩu khi lấy dữ liệu từ DB
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Mã hóa mật khẩu trước khi lưu vào database
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Kiểm tra mật khẩu khi đăng nhập
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const UserAdmin = mongoose.model('UserAdmin', UserSchema);
