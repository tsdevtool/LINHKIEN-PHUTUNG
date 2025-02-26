const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/search', async (req, res) => {
    try {
        const { query } = req.query; 
        if (!query) {
            return res.status(400).json({ message: 'Vui lòng nhập sản phẩm cần tìm kiếm' });
        }
        
       
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;