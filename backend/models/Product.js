import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    manufactured_at: {
        type: Date
    },
    expires_at: {
        type: Date
    },
    image_url: {
        type: String
    },
    image_public_id: {
        type: String
    },
    images: {
        type: Array,
        default: []
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.image_public_id;
            delete ret.deleted_at;
            return ret;
        }
    }
});

// Soft delete functionality
productSchema.add({
    deleted_at: {
        type: Date,
        default: null
    }
});

// Virtual for checking if product is deleted
productSchema.virtual('is_deleted').get(function() {
    return this.deleted_at !== null;
});

// Static methods
productSchema.statics.findActive = function() {
    return this.find({ is_active: true, deleted_at: null });
};

// Soft delete method
productSchema.methods.softDelete = function() {
    this.deleted_at = new Date();
    return this.save();
};

// Restore method
productSchema.methods.restore = function() {
    this.deleted_at = null;
    return this.save();
};

// Update quantity after order
productSchema.methods.updateQuantity = function(quantityToReduce) {
    if (this.quantity < quantityToReduce) {
        throw new Error(`Số lượng sản phẩm ${this.name} trong kho không đủ`);
    }
    
    this.quantity -= quantityToReduce;
    return this.save();
};

// Check if product has enough quantity
productSchema.methods.hasEnoughQuantity = function(requestedQuantity) {
    return this.quantity >= requestedQuantity;
};

// Apply a query filter to exclude soft deleted items
productSchema.pre('find', function() {
    this.where({ deleted_at: null });
});

productSchema.pre('findOne', function() {
    this.where({ deleted_at: null });
});

productSchema.pre('findById', function() {
    this.where({ deleted_at: null });
});

// Query helper for active products
productSchema.query.active = function() {
    return this.where({ is_active: true });
};

const Product = mongoose.model('Product', productSchema);

export default Product; 