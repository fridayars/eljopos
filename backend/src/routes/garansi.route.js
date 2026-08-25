const express = require('express');
const router = express.Router();
const multer = require('multer');
const garansiController = require('../controllers/garansi.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // limit 5MB per file
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

router.get('/laporan', authMiddleware, garansiController.getLaporanKlaim);
router.get('/klaim/:transaksiDetailId', authMiddleware, garansiController.getKlaimDetail);
router.post('/klaim/:transaksiDetailId', authMiddleware, upload.array('images', 5), garansiController.createKlaim); // Max 5 images

module.exports = router;
