import { User as UserAdmin } from "../../models/user.model.js";
import {Role} from "../../models/role.model.js";
import bcrypt from 'bcrypt';

// Lấy tất cả nhân viên (không phải khách hàng)
export const getAllEmployee = async (req, res) => {
    try {
        const roles = await Role.find({ name: 'CUSTOMER' }).select('_id');
        const roleIds = roles.map(role => role._id.toString());  
        
        const users = await UserAdmin.find({ idrole: { $nin: roleIds }, deleted_at: null });
        
        if (!users.length) {
            return res.status(404).json({
                status: 404,
                message: 'Không tìm thấy nhân viên nào.'
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Lấy dữ liệu thành công.',
            users
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Lỗi server: ${error.message}'
        });
    }
};
// Tìm kiếm nhân viên theo tên (firstname hoặc lastname)
    export const searchEmployeeByName = async (req, res) => {
        try {
            const nameEmploy = req.body.name; 
            if (!nameEmploy) {
                return res.status(422).json({
                    status: 422,
                    message: 'Vui lòng cung cấp tên cần tìm kiếm.'
                });
            }

            const nameEmployLower = nameEmploy.toLowerCase();

            const roles = await Role.find({ name: 'CUSTOMER' }).select('_id');
            if (!roles.length) {
                return res.status(404).json({
                    status: 404,
                    message: 'Không tìm thấy vai trò nào có tên CUSTOMER.'
                });
            }

            const roleIds = roles.map(role => role._id.toString());
            const employees = await UserAdmin.find({
                idrole: { $nin: roleIds },
                deleted_at: null,
                $or: [
                    { firstname: { $regex: new RegExp(nameEmployLower, 'i') } },
                    { lastname: { $regex: new RegExp(nameEmployLower, 'i') } }
                ]
            });

            if (!employees.length) {
                return res.status(404).json({
                    status: 404,
                    message: 'Không tìm thấy nhân viên nào phù hợp.'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Tìm kiếm thành công.',
                employees
            });

        } catch (error) {
            console.error("Lỗi server:", error.message);
            return res.status(500).json({
                status: 500,
                message: `Lỗi server: ${error.message}`
            });
        }
    };


// Lấy nhân viên theo ID
export const getEmployeeByID = async (req, res) => {
    try {
        const employee = await UserAdmin.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: 'Không tìm thấy nhân viên.'
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Lấy dữ liệu thành công.',
            employee
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: `Lỗi server: ${error.message}`
        });
    }
};

// Thêm nhân viên
export const addEmployee = async (req, res) => {
    try {
        //const { firstname, lastname, phone, username, password, address, image, numberOfOrder, numberOfOrders, totalSpent, idrole, status } = req.body;

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new UserAdmin({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone,
            username: req.body.username,
            password: hashedPassword,
            address: req.body.address,
            image: req.body.image,
            numberOfOrder: req.body.numberOfOrder,
            numberOfOrders: req.body.numberOfOrders,
            totalSpent: req.body.totalSpent,
            idrole: req.body.idrole,
            status: req.body.status,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
        });

        try {
            await user.save();
            res.status(201).json({
                status: 201,
                message: 'User đã được thêm thành công!',
                user
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Lỗi khi thêm user!',
                error: error.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: `Đã xảy ra lỗi khi thêm user: ${error.message}`
        });
    }
};

// Cập nhật nhân viên
export const updateEmployee = async (req, res) => {
    try {
        const user = await UserAdmin.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'Không tìm thấy nhân viên.'
            });
        }

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        req.body.updated_at = new Date();

        await UserAdmin.findByIdAndUpdate(req.params.id, req.body, { new: true });

        return res.status(200).json({
            status: 200,
            message: 'User đã được cập nhật thành công!',
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: `Đã xảy ra lỗi khi cập nhật user: ${error.message}`
        });
    }
};


export const deleteEmployee = async (req, res) => {
    try {
        const user = await UserAdmin.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'Không tìm thấy nhân viên.'
            });
        }
        user.status = false;
        user.updated_at = new Date();
        user.deleted_at = new Date();
        await user.save();

        return res.status(200).json({
            status: 200,
            message: 'User đã được xóa thành công!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: `Đã xảy ra lỗi khi xóa user: ${error.message}`
        });
    }
};

export const undeleteEmployee = async (req, res) => {
    try {
        const user = await UserAdmin.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'Không tìm thấy nhân viên.'
            });
        }

        user.status = true;
        user.updated_at = new Date();
        user.deleted_at = null;
        await user.save();

        return res.status(200).json({
            status: 200,
            message: 'User đã được khởi động lại!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: `Đã xảy ra lỗi khi xóa user: ${error.message}`
        });
    }
};