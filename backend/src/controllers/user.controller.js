const userService = require('../services/user.service');

const getUsers = async (req, res, next) => {
    try {
        const data = await userService.getUsers(req.query);
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const data = await userService.createUser(req.body);
        return res.status(201).json({ success: true, data, message: 'User berhasil dibuat' });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const data = await userService.updateUser(req.params.id, req.body);
        return res.json({ success: true, data, message: 'User berhasil diperbarui' });
    } catch (error) {
        next(error);
    }
};

const toggleUserStatus = async (req, res, next) => {
    try {
        const data = await userService.toggleUserStatus(req.params.id);
        return res.json({ success: true, data, message: 'Status user berhasil diubah' });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const data = await userService.deleteUser(req.params.id);
        return res.json({ success: true, data, message: 'User berhasil dihapus' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser
};
