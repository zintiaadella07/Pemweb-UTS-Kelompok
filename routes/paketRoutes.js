const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paketController');

router.get('/', ctrl.index);
router.get('/tambah', ctrl.tambahForm);
router.post('/tambah', ctrl.store);
router.get('/:id/edit', ctrl.editForm);
router.post('/:id/edit', ctrl.update);
router.post('/:id/hapus', ctrl.destroy);

module.exports = router;