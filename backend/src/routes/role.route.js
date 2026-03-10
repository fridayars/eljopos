const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Roles routes
router.get('/active', roleController.getAllRoles);
router.get('/', roleController.getRolesPaginated);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.patch('/:id/toggle-status', roleController.toggleRoleStatus);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
