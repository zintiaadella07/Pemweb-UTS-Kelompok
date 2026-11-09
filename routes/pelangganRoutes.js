
const express = require('express');
const router = express.Router();

const pelangganController = require('../controllers/pelangganController');

router.get('/', pelangganController.index);
router.get('/tambah', pelangganController.tambahForm);
router.post('/tambah', pelangganController.store);
router.get('/:id/edit', pelangganController.editForm);
router.post('/:id/edit', pelangganController.update);
router.post('/:id/hapus', pelangganController.destroy);

module.exports = router;
