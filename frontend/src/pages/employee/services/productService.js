import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const productService = {
    async getProducts() {
        try {
            const response = await axios.get(`${API_URL}/products`);
            return response.data.products;
        } catch (error) {
            throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách sản phẩm';
        }
    },

    async searchProducts(query) {
        try {
            const response = await axios.get(`${API_URL}/products/search`, {
                params: { query }
            });
            return response.data.products;
        } catch (error) {
            throw error.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm sản phẩm';
        }
    },

    async getProductById(productId) {
        try {
           

            if (!productId) {
                throw new Error('Product ID is required');
            }

            // Xử lý MongoDB ObjectId
            let id = '';
            
            // Nếu là object MongoDB
            if (productId && typeof productId === 'object') {
                // Thử lấy giá trị _id
                if (productId._id) {
                    id = typeof productId._id === 'object' ? productId._id.toString() : productId._id;
                } 
                // Nếu không có _id, thử lấy giá trị id
                else if (productId.id) {
                    id = typeof productId.id === 'object' ? productId.id.toString() : productId.id;
                }
                // Nếu là ObjectId trực tiếp
                else {
                    id = productId.toString();
                }
            } else {
                // Nếu là string hoặc kiểu dữ liệu khác
                id = String(productId);
            }

           

            // Kiểm tra ID hợp lệ
            if (!id || id === '[object Object]' || id === 'undefined') {
                console.error('Invalid ID after processing:', id);
                throw new Error('Invalid product ID');
            }

            const response = await axios.get(`${API_URL}/products/${id}`);
            
            if (!response.data || !response.data.product) {
                throw new Error('Product not found');
            }

            return {
                success: true,
                product: response.data.product
            };
        } catch (error) {
           
            
            return {
                success: false,
                message: error.response?.data?.message || 'Could not fetch product details'
            };
        }
    }
};

export default productService;