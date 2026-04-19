const express = require('express');
const router = express.Router();
const arusUangController = require('../controllers/arusUang.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createArusUangValidation } = require('../validations/arusUang.validation');

// All Arus Uang routes are protected by authMiddleware
router.use(authMiddleware);

// GET /api/arus-uang
router.get('/', arusUangController.getListArusUang);

// POST /api/arus-uang
router.post('/', createArusUangValidation, validate, arusUangController.createArusUangManual);

// POST /api/arus-uang/sync
router.post('/sync', arusUangController.syncArusUang);

// DELETE /api/arus-uang/:id (Only for MANUAL source)
router.delete('/:id', arusUangController.deleteArusUangManual);

module.exports = router;
