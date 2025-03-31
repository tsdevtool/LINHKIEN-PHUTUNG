import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService';
import productService from '../services/productService';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Constants
const INITIAL_STATE = {
    products: [],
    selectedProducts: [],
    isSearchActive: false,
    searchTerm: '',
    shippingFee: 0,
    discount: 0,
    paymentMethod: '',
    shippingMethod: '',
    staff: '',
    note: '',
    loading: false,
    error: null
};

const PAYMENT_METHODS = {
    CASH: "Tiền mặt",
    PAYOS: "PayOS",
    COD: "COD"
};

const SHIPPING_METHODS = {
    STORE_PICKUP: "Nhận tại cửa hàng",
    DELIVERED: "Đã giao hàng",
    SHIPPING: "Đã qua hàng vận chuyển",
    PENDING: "Giao hàng sau"
};

// Validation functions
const validateOrderData = (orderData) => {
    if (!orderData || typeof orderData !== 'object') {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
    }

    const requiredFields = {
        customer_id: 'ID khách hàng',
        customer_info: 'thông tin khách hàng',
        items: 'sản phẩm',
        payment_method: 'phương thức thanh toán',
        shipping_method: 'phương thức giao hàng',
        staff_id: 'nhân viên phụ trách'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        if (!orderData[field]) {
            throw new Error(`Thiếu ${label}`);
        }
    }

    if (!orderData.customer_info.name || !orderData.customer_info.phone) {
        throw new Error('Thiếu thông tin tên hoặc số điện thoại khách hàng');
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một sản phẩm');
    }
};

const validateProduct = (product) => {
    if (!product._id && !product.id) {
        throw new Error('Sản phẩm không có ID');
    }
    if (!product.name || !product.price) {
        throw new Error('Sản phẩm thiếu thông tin tên hoặc giá');
    }
};

// Status determination functions
const determinePaymentStatus = (paymentMethod) => {
    switch (paymentMethod) {
        case PAYMENT_METHODS.PAYOS:
            return "pending";
        case PAYMENT_METHODS.CASH:
            return "paid";
        case PAYMENT_METHODS.COD:
            return "pending";
        default:
            return "unpaid";
    }
};

const determineShippingStatus = (shippingMethod) => {
    switch (shippingMethod) {
        case SHIPPING_METHODS.DELIVERED:
            return "delivered";
        case SHIPPING_METHODS.SHIPPING:
            return "shipping";
        case SHIPPING_METHODS.STORE_PICKUP:
            return "delivered";
        default:
            return "pending";
    }
};

const determineOrderStatus = (shippingMethod, paymentMethod) => {
    // Nếu là PayOS, luôn để pending cho đến khi thanh toán thành công
    if (paymentMethod === PAYMENT_METHODS.PAYOS) {
        return "pending";
    }
    
    // Nếu nhận tại cửa hàng và thanh toán tiền mặt -> completed
    if (shippingMethod === SHIPPING_METHODS.STORE_PICKUP && paymentMethod === PAYMENT_METHODS.CASH) {
        return "completed";
    }

    // Nếu đã giao hàng và thanh toán tiền mặt -> completed
    if (shippingMethod === SHIPPING_METHODS.DELIVERED && paymentMethod === PAYMENT_METHODS.CASH) {
        return "completed";
    }

    // Nếu chỉ đã giao hàng hoặc nhận tại cửa hàng -> delivered
    if (shippingMethod === SHIPPING_METHODS.DELIVERED || shippingMethod === SHIPPING_METHODS.STORE_PICKUP) {
        return "delivered";
    }

    // Nếu đang giao hàng -> shipping
    if (shippingMethod === SHIPPING_METHODS.SHIPPING) {
        return "shipping";
    }

    // Mặc định -> pending
    return "pending";
};

const normalizeProductData = (product, quantity = 1) => ({
    _id: product._id || product.id,
    uniqueId: Date.now().toString(),
    name: product.name,
    price: parseFloat(product.price),
    sku: product.sku || product.code || '',
    image_url: product.image_url || product.imageUrl || '',
    quantity: parseInt(quantity, 10) || 1
});

export const useOrder = () => {
    // State initialization
    const [state, setState] = useState(INITIAL_STATE);
    const {
        products,
        selectedProducts,
        isSearchActive,
        searchTerm,
        shippingFee,
        discount,
        paymentMethod,
        shippingMethod,
        staff,
        note,
        loading,
        error
    } = state;

    // Computed values
    const totalProductPrice = selectedProducts.reduce(
        (sum, product) => sum + (product.price * product.quantity),
        0
    );

    const finalTotal = totalProductPrice - discount + shippingFee;

    // Update state utility
    const updateState = useCallback((newState) => {
        setState(prev => ({ ...prev, ...newState }));
    }, []);

    // Error handling utility
    const handleError = useCallback((error, customMessage = '') => {
        console.error(customMessage || 'Error:', error);
        updateState({ 
            error: error.message || 'Đã xảy ra lỗi, vui lòng thử lại',
            loading: false 
        });
    }, [updateState]);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        try {
            updateState({ loading: true, error: null });
            const data = await productService.getProducts();
            updateState({ products: data });
        } catch (error) {
            handleError(error, 'Error fetching products:');
        } finally {
            updateState({ loading: false });
        }
    }, [updateState, handleError]);

    // Initial fetch
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Search products
    const handleSearch = useCallback(async (query) => {
        if (!query?.trim()) {
            await fetchProducts();
            return;
        }

        try {
            updateState({ loading: true, error: null });
            const results = await productService.searchProducts(query);
            updateState({ products: results });
        } catch (error) {
            handleError(error, 'Error searching products:');
        } finally {
            updateState({ loading: false });
        }
    }, [fetchProducts, updateState, handleError]);

    // Add product
    const addProduct = useCallback((product, quantity = 1) => {
        try {
            validateProduct(product);
            const normalizedProduct = normalizeProductData(product, quantity);
            updateState({
                selectedProducts: [...state.selectedProducts, normalizedProduct],
                isSearchActive: false,
                error: null
            });
        } catch (error) {
            handleError(error, 'Error adding product:');
        }
    }, [state.selectedProducts, updateState, handleError]);

    // Update product quantity
    const updateProductQuantity = useCallback((uniqueId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        if (quantity <= 0) {
            handleError(new Error('Số lượng phải lớn hơn 0'));
            return;
        }

        updateState({
            selectedProducts: state.selectedProducts.map(product =>
                product.uniqueId === uniqueId
                    ? { ...product, quantity: quantity }
                    : product
            )
        });
    }, [state.selectedProducts, updateState, handleError]);

    // Remove product
    const removeProduct = useCallback((uniqueId) => {
        updateState({
            selectedProducts: state.selectedProducts.filter(
                product => product.uniqueId !== uniqueId
            )
        });
    }, [state.selectedProducts, updateState]);

    // Create order
    const createOrder = useCallback(async (orderData) => {
        try {
            updateState({ loading: true, error: null });

            // Validate order data
            validateOrderData(orderData);

            // Transform data to snake_case format
            const transformedData = {
                ...orderData,
                payment_status: determinePaymentStatus(orderData.payment_method),
                shipping_status: determineShippingStatus(orderData.shipping_method),
                status: determineOrderStatus(orderData.shipping_method, orderData.payment_method),
                staff_info: {
                    name: orderData.staff_id,
                    role: 'employee'
                }
            };

            console.log('Transformed order data:', transformedData);
            const response = await orderService.createOrder(transformedData);

            // Reset form
            updateState({
                selectedProducts: [],
                shippingFee: 0,
                discount: 0,
                paymentMethod: '',
                shippingMethod: '',
                staff: '',
                note: '',
                error: null
            });

            return response;
        } catch (error) {
            handleError(error, 'Error creating order:');
            throw error;
        } finally {
            updateState({ loading: false });
        }
    }, [updateState, handleError]);

    // Field setters
    const setters = {
        setSearchTerm: useCallback((term) => updateState({ searchTerm: term }), [updateState]),
        setIsSearchActive: useCallback((active) => updateState({ isSearchActive: active }), [updateState]),
        setShippingFee: useCallback((fee) => updateState({ shippingFee: parseFloat(fee) || 0 }), [updateState]),
        setDiscount: useCallback((value) => updateState({ discount: parseFloat(value) || 0 }), [updateState]),
        setPaymentMethod: useCallback((method) => updateState({ paymentMethod: method }), [updateState]),
        setShippingMethod: useCallback((method) => updateState({ shippingMethod: method }), [updateState]),
        setStaff: useCallback((value) => updateState({ staff: value }), [updateState]),
        setNote: useCallback((value) => updateState({ note: value }), [updateState])
    };

    // Xử lý submit đơn hàng
    const handleSubmitOrder = async (selectedCustomer, navigate) => {
        try {
            if (!selectedCustomer?._id) {
                console.error('Missing customer ID:', selectedCustomer);
                throw new Error('Vui lòng chọn khách hàng');
            }

            if (!selectedProducts || selectedProducts.length === 0) {
                console.error('No products selected');
                throw new Error('Vui lòng chọn ít nhất một sản phẩm');
            }

            // Log thông tin trước khi tạo đơn hàng
            console.log('Selected customer:', selectedCustomer);
            console.log('Selected products:', selectedProducts);

            // Đảm bảo các trường của customer_info có giá trị mặc định
            const customer_info = {
                name: selectedCustomer?.name || '',
                phone: selectedCustomer?.phone || '',
                email: selectedCustomer?.email || '',
                address: selectedCustomer?.address || ''
            };

            // Kiểm tra các trường bắt buộc
            if (!customer_info.name || !customer_info.phone ) {
                throw new Error('Thiếu thông tin khách hàng (tên, số điện thoại hoặc địa chỉ)');
            }

            const orderData = {
                customer_id: selectedCustomer._id,
                customer_info,
                items: selectedProducts.map(product => {
                    const price = parseFloat(product.price);
                    const quantity = parseInt(product.quantity, 10) || 1;
                    return {
                        product_id: product._id,
                        price,
                        quantity,
                        total: price * quantity
                    };
                }),
                total_amount: parseFloat(totalProductPrice),
                discount: parseFloat(discount || 0),
                shipping_fee: parseFloat(shippingFee || 0),
                finaltotal: parseFloat(finalTotal),
                payment_method: paymentMethod,
                shipping_method: shippingMethod,
                note: note || '',
                staff_id: staff
            };

            // Log dữ liệu đơn hàng trước khi gửi
            console.log('Order data before sending:', orderData);

            const response = await createOrder(orderData);

            // Nếu phương thức thanh toán là PayOS, tạo payment link
            if (paymentMethod === "PayOS") {
                try {
                    console.log('Creating payment link for order:', response.order);
                    const orderId = response.order?._id;
                    if (!orderId) {
                        throw new Error('Không tìm thấy ID đơn hàng');
                    }
                    
                    // Tạo returnUrl để quay lại khi thanh toán xong
                    const returnUrl = encodeURIComponent(`/employee/orders/${orderId}`);
                    
                    console.log('Sending request to create payment with orderId:', orderId);
                    const paymentResponse = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/${orderId}/payment`,
                        {
                            // Thêm return URL vào request
                            return_url: `${window.location.origin}/payment/success?orderCode=${orderId}&returnUrl=${returnUrl}`,
                            cancel_url: `${window.location.origin}/payment/cancel?orderCode=${orderId}&returnUrl=${returnUrl}`
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log('Payment response:', paymentResponse);
                    
                    if (!paymentResponse.data?.paymentUrl) {
                        throw new Error('Không nhận được URL thanh toán từ PayOS');
                    }

                    // Chuyển hướng người dùng đến trang thanh toán PayOS
                    window.location.href = paymentResponse.data.paymentUrl;
                    return;
                } catch (error) {
                    console.error('Error creating payment link:', error.response || error);
                    const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo link thanh toán PayOS';
                    toast.error(errorMessage);
                    throw error;
                }
            }

            // Hiển thị thông báo thành công
            toast.success('Tạo đơn hàng thành công!');
            
            // Reset form
            updateState({
                selectedProducts: [],
                shippingFee: 0,
                discount: 0,
                paymentMethod: '',
                shippingMethod: '',
                staff: '',
                note: '',
                error: null
            });

            // Chuyển hướng về trang danh sách đơn hàng
            if (navigate) {
                navigate('/employee/orders');
            }

        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
            throw error;
        }
    };

    const handleCancelOrder = async (orderId, reason) => {
        try {
            // Lấy thông tin đơn hàng trước khi hủy
            const orderResponse = await orderService.getOrderById(orderId);
            if (!orderResponse.success || !orderResponse.order) {
                throw new Error('Không thể tải thông tin đơn hàng');
            }

            const order = orderResponse.order;

            // Kiểm tra điều kiện có thể hủy đơn
            if (order.shippingStatus === 'shipping' || order.shippingStatus === 'delivered') {
                throw new Error('Không thể hủy đơn hàng đã giao cho đơn vị vận chuyển');
            }

            // Hủy đơn hàng
            const response = await orderService.cancelOrder(orderId, reason);
            
            if (response.success) {
                // Cập nhật lại số lượng trong kho
                const updateStockPromises = order.items.map(async (item) => {
                    try {
                        const productResponse = await productService.getProductById(item.productId);
                        if (productResponse.success && productResponse.product) {
                            const newQuantity = productResponse.product.quantity + item.quantity;
                            await productService.updateProduct(item.productId, {
                                quantity: newQuantity
                            });
                        }
                    } catch (error) {
                        console.error(`Error updating stock for product ${item.productId}:`, error);
                        // Ghi log lỗi nhưng không throw để tiếp tục xử lý các sản phẩm khác
                    }
                });

                await Promise.all(updateStockPromises);
                
                toast.success('Hủy đơn hàng thành công');
                return response;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error in handleCancelOrder:', error);
            toast.error(error.message || 'Không thể hủy đơn hàng');
            throw error;
        }
    };

    return {
        // State
        products,
        selectedProducts,
        isSearchActive,
        searchTerm,
        shippingFee,
        discount,
        paymentMethod,
        shippingMethod,
        staff,
        note,
        loading,
        error,
        totalProductPrice,
        finalTotal,

        // Actions
        ...setters,
        addProduct,
        updateProductQuantity,
        removeProduct,
        handleSearch,
        createOrder,
        handleSubmitOrder,
        handleCancelOrder,

        // Constants
        PAYMENT_METHODS,
        SHIPPING_METHODS
    };
};

export default useOrder; 