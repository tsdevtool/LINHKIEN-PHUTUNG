import mongoose from 'mongoose';
import moment from 'moment';

const orderSchema = new mongoose.Schema({
    order_number: {
        type: String,
        unique: true,
        sparse: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    customer_info: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantity: { 
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        total: { type: Number, required: true }
    }],
    total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    shipping_fee: {
        type: Number,
        default: 0,
        min: 0
    },
    finaltotal: {
        type: Number,
        required: true,
        min: 0
    },
    payment_method: {
        type: String,
        required: true,
        enum: ['cash', 'payos', 'cod', 'Tiền mặt', 'PayOS', 'COD'],
        set: function(value) {
            // Convert frontend values to database values
            const mapping = {
                'Tiền mặt': 'cash',
                'PayOS': 'payos',
                'COD': 'cod'
            };
            return mapping[value] || value.toLowerCase();
        }
    },
    payment_status: {
        type: String,
        default: 'pending',
        enum: ['paid', 'unpaid', 'pending']
    },
    shipping_method: {
        type: String,
        required: true,
        enum: ['Nhận tại cửa hàng', 'Đã giao hàng', 'Giao cho bên vận chuyển', 'Giao hàng sau']
    },
    shipping_status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'shipping', 'delivered']
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'completed', 'cancelled']
    },
    note: String,
    staff_id: {
        type: String,
        required: true
    },
    staff_info: {
        name: { type: String, required: true }
    },
    payment_info: {
        provider: String,
        payment_id: String,
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'cancelled']
        },
        transaction_id: String,
        paid_at: Date
    },
    confirmed_at: {
        type: Date,
        default: null
    },
    shipping_updated_at: {
        type: Date,
        default: null
    },
    delivered_at: {
        type: Date,
        default: null
    },
    cancelled_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Instance methods
orderSchema.methods.updateStatus = async function(newStatus) {
    this.status = newStatus;
    return this.save();
};

// Static methods
orderSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

// Thêm phương thức tĩnh để tạo mã đơn hàng
orderSchema.statics.generateOrderNumber = async function() {
    try {
        const prefix = 'DH';
        const date = moment().format('YYMMDD');
        
        // Tìm đơn hàng cuối cùng có ngày hôm nay để lấy sequence
        const lastOrder = await this.findOne({
            order_number: new RegExp(`^${prefix}${date}`)
        }).sort({ order_number: -1 });

        let sequence = 1;
        if (lastOrder && lastOrder.order_number) {
            const lastSequence = lastOrder.order_number.slice(-4);
            if (!isNaN(parseInt(lastSequence))) {
                sequence = parseInt(lastSequence) + 1;
            }
        }

        const orderNumber = `${prefix}${date}${String(sequence).padStart(4, '0')}`;
        console.log("Generated order number:", orderNumber);
        return orderNumber;
    } catch (error) {
        console.error("Error generating order number:", error);
        // Fallback to timestamp-based order number if error
        return `DH${Date.now()}`;
    }
};

const Order = mongoose.model('Order', orderSchema);

export default Order; 