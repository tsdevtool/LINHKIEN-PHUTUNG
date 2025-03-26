import mongoose from 'mongoose';
import moment from 'moment';

const orderSchema = new mongoose.Schema({
    order_number: {
        type: String,
        unique: true,
        sparse: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    customerInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
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
        name: String,
        total: Number
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingFee: {
        type: Number,
        default: 0,
        min: 0
    },
    finalTotal: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: [
            'cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay', 'vnpay', 'cod',
            'Tiền mặt', 'Chuyển khoản', 'Thẻ tín dụng', 'Ví Momo', 'ZaloPay', 'VNPay', 'COD (Thu hộ)'
        ]
    },
    paymentStatus: {
        type: String,
        default: 'unpaid',
        enum: ['paid', 'unpaid', 'partially_paid', 'Đã thanh toán', 'Chưa thanh toán', 'Thanh toán một phần']
    },
    shippingMethod: {
        type: String,
        required: true
    },
    shippingStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'shipping', 'delivered', 'Chờ xử lý', 'Đang giao hàng', 'Đã giao hàng']
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled', 'Chờ xử lý', 'Đã xác nhận', 'Đang giao hàng', 'Hoàn thành', 'Đã hủy']
    },
    note: String,
    staffId: {
        type: String,
        required: true
    },
    staffInfo: {
        name: { type: String, required: true }
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