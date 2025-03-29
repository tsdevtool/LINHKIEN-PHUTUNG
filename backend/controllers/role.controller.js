import {Role} from "./../models/role.model.js";

// Thêm mới
export const addRole = async (req, res) => {
    try {
        console.log(req.body);
        const { name } = req.body;
        if (!name) return res.status(400).json({ status: 400, message: "Tên Role là bắt buộc!" });

        // Kiểm tra xem Role đã tồn tại chưa
        const existingRole = await Role.findOne({ name });
        if (existingRole) return res.status(422).json({ status: 422, message: "Role đã tồn tại trong hệ thống." });

        const role = new Role({ name });
        console.log(role);
        await role.save();
        res.status(201).json({ status: 201, message: "Role được thêm thành công!" });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi server", error });
    }
};

// Xóa Role
export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id);

        if (!role) return res.status(404).json({ status: 404, message: "Không tìm thấy Role!" });

        role.deleted_at = Date.now();
        role.updated_at = Date.now();
        await role.save();

        res.status(200).json({ status: 200, message: "Đã xoá Role thành công!" });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi server", error });
    }
};

// Kích hoạt lại Role
export const restoreRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id);

        if (!role) return res.status(404).json({ status: 404, message: "Không tìm thấy Role!" });

        role.deleted_at = null;
        role.updated_at = Date.now();
        await role.save();

        res.status(200).json({ status: 200, message: "Khôi phục Role thành công!" });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi server", error });
    }
};

export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ updated_at: "asc" });
        res.status(200).json({ status: 200, roles });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi server", error });
    }
};

// Lấy Role đang hoạt động
export const getAllActiveRoles = async (req, res) => {
    try {
        const roles = await Role.find({ deleted_at: null }).sort({ updated_at: "asc" });
        res.status(200).json({ status: 200, roles });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi server", error });
    }
};

// Cập nhật Role
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) return res.status(400).json({ status: 400, message: "Tên Role là bắt buộc!" });

        const role = await Role.findById(id);
        if (!role) return res.status(404).json({ status: 404, message: "Không tìm thấy Role!" });

        role.name = name;
        role.updated_at = Date.now();
        await role.save();

        res.status(200).json({ status: 200, message: "Cập nhật Role thành công!", role });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi server", error });
    }
};
