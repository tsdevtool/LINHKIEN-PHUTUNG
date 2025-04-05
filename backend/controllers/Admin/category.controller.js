import Category from '../../models/category.model.js';
import mongoose from 'mongoose';
import Product  from '../../models/Product.js';

class CategoryController {

    // Lấy danh sách category cấp 0 (root)
    static async index(req, res) {
        try {
            // category  level = 0 và active
            const categories = await Category.active()
            .where('level', 0).where('is_active', true);
        
        // Lấy các category cấp 1
            const categoriesChild = await Category.active()
                .where('level', 1).where('is_active', true);  

            const formattedCategories = categories.map(category => ({
                id: category._id,
                name: category.name,
                categories: categoriesChild
                    .filter(child => child.parent_id.toString() === category._id.toString())  // Lọc các category con có parent_id trùng với _id của category cha
                    .map(child => ({
                        id: child._id,
                        name: child.name,
                        parent: {
                            id: child.parent_id,
                            name: child.parent_name
                        }
                    }))
            }));
            // Trả về danh sách categories dưới dạng JSON
            return res.status(200).json({
                status: 200,
                categories: formattedCategories
            });
        } catch (error) {
            console.error('Error fetching categories:', error.message);
            return res.status(500).json({
                status: 500,
                message: 'Error fetching categories'
            });
        }
    }
    // Lấy thông tin chi tiết category(chứa cả category con(nếu có)) theo ID
    static async show(req, res) {
        try {
            const products = await Product.find({is_active:true});
            const category = await Category.findById(req.params.id).where('is_active', true);
            const productParent= products.filter(pro=>pro.category_id.toString() ===category._id.toString())||[];
            if (!category) {
                return res.status(404).json({
                    status: 404,
                    message: 'Category not found'
                });
            }
            const categoriesChild = await Category
                    .where('level', 1).where('is_active', true);
            if (category.level == 0) {
                const formattedCategory = {
                    id: category._id,
                    name: category.name,
                    product:productParent,
                    categories: categoriesChild
                        .filter(child => child.parent_id.toString() === category._id.toString()) 
                        .map(child => {
                            const productsChil = products.filter(pro => pro.category_id.toString() === child._id.toString());
                
                            return {
                                id: child._id,
                                name: child.name,
                                parent: {
                                    id: category._id,
                                    name: category.name
                                },
                                products: productsChil
                            };
                        })
                };
                
                return res.status(200).json({
                    status: 200,
                    category: formattedCategory
                });
            }else{

                const categorieFormatt = {
                    id : category.id,
                    name : category.name,
                    parent : {
                        id : category.parent_id,
                        name: category.parent_name
                    },
                    products : products.filter(child => child.category_id.toString() === category._id.toString())
                }
                return res.status(200).json({
                    status: 200,
                    category: categorieFormatt
                });
            }
        } catch (error) {
            console.error('Error fetching category:', error.message);
            return res.status(500).json({
                status: 500,
                message: 'Error fetching category'
            });
        }
    }

    static async store(req, res) {
        if(!req.body.name)
        {
            res.status(422).json({
                status: 422,
                message: 'Vui lòng nhập tên'
            }); 
        }

        try {
            // Tạo mới category
            const category = await Category.create({
                name: req.body.name,
                parent_id: req.body.parent_id || null,
                is_active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            });
            return res.status(201).json({
                status: 201,
                message: 'Tạo thành công',
                category: category
            });
        } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({
                status: 500,
                message: 'Error creating category'
            });
        }
    }
    static async edit(req, res) {
        if(!req.body.name)
        {
            res.status(422).json({
                status: 422,
                message: 'Vui lòng nhập tên'
            }); 
        }
        try {
            const category = await Category.findById(req.params.id);
            
            category.name = req.body.name;
            if(req.body.parent_id)
            {
                const parentCategory = await Category.findById(req.body.parent_id);
                category.parent_id = req.body.parent_id;
                category.parent_name = parentCategory.name;
            }
            category.updated_at = Date.now();
            category.save();
            return res.status(201).json({
                status: 201,
                message: 'Cập nhật thành công',
                category: category
            });
        } catch (error) {
            console.error('Error edit category:', error);
            return res.status(500).json({
                status: 500,
                message: 'Error edit category'
            });
        }
    }
    static async delete(req, res) {
        try {
            const category = await Category.findById(req.params.id);

            category.deleted_at = Date.now();
            category.updated_at = Date.now();
            category.save();
            return res.status(201).json({
                status: 201,
                message: 'Xóa thành công'
            });
        } catch (error) {
            console.error('Error edit category:', error);
            return res.status(500).json({
                status: 500,
                message: 'Error edit category'
            });
        }
    }
    static async undelete(req, res) {
        try {
            const category = await Category.findById(req.params.id);

            category.deleted_at = null;
            category.updated_at = Date.now();
            category.save();
            return res.status(201).json({
                status: 201,
                message: 'Đã cập nhật thành công'
            });
        } catch (error) {
            console.error('Error edit category:', error);
            return res.status(500).json({
                status: 500,
                message: 'Error edit category'
            });
        }
    }
    static async deleteCate(req, res)
    {
        try {
            const result = await Category.findByIdAndDelete(req.params.id);
    
            if (!result) {
                return res.status(404).json({
                    status: 404,
                    message: 'Không tìm thấy Category cần xóa'
                });
            }
            return res.status(200).json({
                status: 200,
                message: 'Xóa Category thành công'
            });
        } catch (error) {
            console.error('Lỗi khi xóa Category:', error);
            return res.status(500).json({
                status: 500,
                message: 'Lỗi khi xóa Category'
            });
        }
    }
    static async getCateDele(req, res) { //đang sai
        try {
            // Lấy danh sách các category có 'is_active' là true
            const categories = await Category.find({
                is_active: true,
                deleted_at: { $exists: true, $ne: null }
            });
    
            // Nếu không có dữ liệu
            if (!categories || categories.length === 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Không có dữ liệu'
                });
            }
    
            // Trả về danh sách categories
            return res.status(200).json({
                status: 200,
                message: 'Lấy dữ liệu thành công',
                categories: categories
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            return res.status(500).json({
                status: 500,
                message: 'Lỗi khi lấy dữ liệu'
            });
        }
    }
    
    
}

export default CategoryController;
