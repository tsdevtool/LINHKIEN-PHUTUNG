import mongoose from "mongoose";

// Bảng Product
const productSchema =  mongoose.Schema({
    nameProduct: {
        type: String,
        required: true,
        trim: true
    },
    descriptionProduct: {
        type: String,
        required: true,
        trim: true
    },
    quantityProduct: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,  // Dùng ObjectId để liên kết với CategoryProduct
        ref: "CategoryProduct",
    },
    HSD: {
        type: Date,
        required: true
    },
    dateUpdate: {
        type: Date,
        default: Date.now
    },
    money: {
        type: Number,
        required: true,
        min: 0
    }
});
export const Product = mongoose.model("Product", productSchema);
