import mongoose from "mongoose";

const supplierSchema = mongoose.Schema({
    nameSupplier: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    }
});

export const SupplierProduct = mongoose.model("SupplierProduct", supplierSchema);