const express = require('express');
const router = express.Router();
const multer = require('multer');
const teknisiController = require('../controllers/teknisi.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Setup multer for memory storage (same pattern as upload.route.js)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // limit 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// GET /api/teknisi/transactions — List transaksi with layanan items (paginated)
router.get('/transactions', authMiddleware, teknisiController.getTransactions);

// GET /api/teknisi/insentif-total — Total insentif for a date range (summary card)
router.get('/insentif-total', authMiddleware, teknisiController.getInsentifTotal);

// GET /api/teknisi/transactions/:id — Detail transaksi (layanan items + uploads)
router.get('/transactions/:id', authMiddleware, teknisiController.getTransactionDetail);

// POST /api/teknisi/upload/:transaksiDetailId — Upload bukti pengerjaan
router.post('/upload/:transaksiDetailId', authMiddleware, upload.single('image'), teknisiController.uploadImage);

// DELETE /api/teknisi/upload/:uploadId — Hapus bukti pengerjaan
router.delete('/upload/:uploadId', authMiddleware, teknisiController.deleteImage);

module.exports = router;
