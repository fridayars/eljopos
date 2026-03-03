const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/dashboard/summary
router.get('/summary', authMiddleware, dashboardController.getSummary);

// GET /api/dashboard/recent-transactions
router.get('/recent-transactions', authMiddleware, dashboardController.getRecentTransactions);

// PUT /api/dashboard/notes
router.put('/notes', authMiddleware, dashboardController.updateNotes);

module.exports = router;
