const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET active staff (for dropdowns)
router.get('/active', staffController.getAllActiveStaff);

// CRUD routes
router.get('/', staffController.getStaff);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.patch('/:id/status', staffController.toggleStaffStatus);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
