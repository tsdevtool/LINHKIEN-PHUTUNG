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

    async getProductById(id) {
        try {
            const response = await axios.get(`${API_URL}/products/${id}`);
            console.log('Product API response:', response.data);
            
            if (response.status === 200) {
                return {
                    success: true,
                    product: response.data.product
                };
            }
            
            return {
                success: false,
                message: 'Không thể tải thông tin sản phẩm'
            };
        } catch (error) {
            console.error('Error in getProductById:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin sản phẩm'
            };
        }
    }
};

export default productService;