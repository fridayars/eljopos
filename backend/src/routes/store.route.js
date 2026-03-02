const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

// GET /api/master/stores
// Public or protected route? Based on LoginPage, it seems it should be public so users can fetch store list BEFORE logging in.
// If it needs to be protected, authMiddleware would be added here.
router.get('/', storeController.getAllStores);

module.exports = router;
