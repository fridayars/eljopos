const express = require('express');
const router = express.Router();
const tipeHpController = require('../controllers/tipeHp.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, tipeHpController.getAllTipeHp);
router.post('/', authMiddleware, tipeHpController.createTipeHp);

module.exports = router;
