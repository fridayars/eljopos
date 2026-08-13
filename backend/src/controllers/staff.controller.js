const staffService = require('../services/staff.service');

/**
 * GET /api/staff/active
 */
const getAllActiveStaff = async (req, res, next) => {
    try {
        const data = await staffService.getAllActiveStaff();
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/staff
 */
const getStaff = async (req, res, next) => {
    try {
        const data = await staffService.getStaff(req.query);
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/staff
 */
const createStaff = async (req, res, next) => {
    try {
        const data = await staffService.createStaff(req.body);
        return res.status(201).json({ success: true, data, message: 'Staff berhasil dibuat' });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/staff/:id
 */
const updateStaff = async (req, res, next) => {
    try {
        const data = await staffService.updateStaff(req.params.id, req.body);
        return res.json({ success: true, data, message: 'Staff berhasil diperbarui' });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/staff/:id/status
 */
const toggleStaffStatus = async (req, res, next) => {
    try {
        const data = await staffService.toggleStaffStatus(req.params.id);
        return res.json({ success: true, data, message: 'Status staff berhasil diubah' });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/staff/:id
 */
const deleteStaff = async (req, res, next) => {
    try {
        const data = await staffService.deleteStaff(req.params.id);
        return res.json({ success: true, data, message: 'Staff berhasil dihapus' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllActiveStaff,
    getStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
};
