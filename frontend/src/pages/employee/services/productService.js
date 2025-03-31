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
            // Convert ObjectId or any object to string safely
            const id = (typeof productId === 'object' && productId.toString) 
                ? productId.toString() 
                : String(productId);
            
            console.log('getProductById - ID to be used:', id);
    
            const response = await axios.get(`${API_URL}/products/${id}`);
            console.log('getProductById - API Response:', response);
    
            if (response.data && response.data.product) {
                return {
                    success: true,
                    product: response.data.product
                };
            }
    
            return {
                success: false,
                message: 'Product not found'
            };
        } catch (error) {
            console.error('Error in getProductById:', error);
            return {
                success: false,
                message: error.message || 'Could not fetch product details'
            };
        }
    }
};

export default productService;