const express = require('express');
const router = express.Router();
const wilayahController = require('../controllers/wilayah.controller');

// GET /wilayah/provinces
router.get('/provinces', wilayahController.getProvinces);

// GET /wilayah/regencies?province_code=xx
router.get('/regencies', wilayahController.getRegencies);

// GET /wilayah/districts?regency_code=xx.xx
router.get('/districts', wilayahController.getDistricts);

module.exports = router;
