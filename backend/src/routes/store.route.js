const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

// GET /api/master/stores/active (dropdown support)
router.get('/active', storeController.getAllStores);

// CRUD routes
// We map /api/master/stores to the new paginated handler
router.get('/', storeController.getStores);
router.post('/', storeController.createStore);
router.put('/:id', storeController.updateStore);
router.patch('/:id/status', storeController.toggleStoreStatus);
router.delete('/:id', storeController.deleteStore);

module.exports = router;
