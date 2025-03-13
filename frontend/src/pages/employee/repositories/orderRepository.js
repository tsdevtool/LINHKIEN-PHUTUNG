import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

class OrderRepository {
    async getAllProducts() {
        try {
            const response = await axios.get(`${API_URL}/products`);
            return response.data.products || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
            const response = await axios.post(`${API_URL}/orders`, orderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async searchProducts(query) {
        try {
            const response = await axios.get(`${API_URL}/products/search?q=${query}`);
            return response.data.products || [];
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }
}

export default new OrderRepository(); 