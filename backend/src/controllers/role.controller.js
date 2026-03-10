const roleService = require('../services/role.service');

const getAllRoles = async (req, res, next) => {
    try {
        const roles = await roleService.getAllRoles();
        return res.json({ success: true, data: roles });
    } catch (error) {
        next(error);
    }
};

const getRolesPaginated = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
        const roles = await roleService.getRolesPaginated(page, limit, search, sortBy, sortOrder);
        return res.json({ success: true, data: roles });
    } catch (error) {
        next(error);
    }
};

const getRoleById = async (req, res, next) => {
    try {
        const role = await roleService.getRoleById(req.params.id);
        return res.json({ success: true, data: role });
    } catch (error) {
        next(error);
    }
};

const createRole = async (req, res, next) => {
    try {
        const role = await roleService.createRole(req.body);
        return res.status(201).json({ success: true, data: role, message: 'Role berhasil dibuat' });
    } catch (error) {
        next(error);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const role = await roleService.updateRole(req.params.id, req.body);
        return res.json({ success: true, data: role, message: 'Role berhasil diperbarui' });
    } catch (error) {
        next(error);
    }
};

const toggleRoleStatus = async (req, res, next) => {
    try {
        const role = await roleService.toggleRoleStatus(req.params.id);
        return res.json({ success: true, data: role, message: 'Status role berhasil diubah' });
    } catch (error) {
        next(error);
    }
};

const deleteRole = async (req, res, next) => {
    try {
        const result = await roleService.deleteRole(req.params.id);
        return res.json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRoles,
    getRolesPaginated,
    getRoleById,
    createRole,
    updateRole,
    toggleRoleStatus,
    deleteRole
};
