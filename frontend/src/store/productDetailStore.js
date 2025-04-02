import axios from 'axios';
import { toast } from 'react-toastify';

const productDetailStore = {
    async getDetailProductbyID(id) {
        try {
          const response = await axios.get(`/api/products/${id}`);
          return response.data.product;
        } catch (error) {
          toast.error('Lỗi truy xuất sản phẩm');
          return [];
        }
    }

};
export default productDetailStore;