import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

class ProductService {
    async getProducts() {
        try {
            const response = await axios.get(`${API_URL}/products`);
            return response.data.products;
        } catch (error) {
            throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách sản phẩm';
        }
    }

    async searchProducts(query) {
        try {
            const response = await axios.get(`${API_URL}/products/search`, {
                params: { query }
            });
            return response.data.products;
        } catch (error) {
            throw error.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm sản phẩm';
        }
    }

    async getProductById(id) {
        try {
            const response = await axios.get(`${API_URL}/products/${id}`);
            return response.data.product;
        } catch (error) {
            throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin sản phẩm';
        }
    }
}

export default new ProductService(); 