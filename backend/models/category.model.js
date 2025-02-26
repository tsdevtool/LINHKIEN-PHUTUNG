import mongoose from "mongoose";
// Bảng CategoryProduct
const categorySchema =  mongoose.Schema({
    nameCategory: {
        type: String,
        required: true,
        trim: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,  // Dùng ObjectId để liên kết với CategoryProduct
        ref: "SupplierProduct",
        required: true
    }
});
export const CategoryProduct = mongoose.model("CategoryProduct", categorySchema);
