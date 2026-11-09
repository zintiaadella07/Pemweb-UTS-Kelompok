const express = require('express');
<<<<<<< HEAD
=======
const paketController = require('../controllers/paketController');
const { uploadGambarPaket } = require('../middleware/upload');

>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)
const router = express.Router();
const ctrl = require('../controllers/paketController');

<<<<<<< HEAD
router.get('/', ctrl.index);
router.get('/tambah', ctrl.tambahForm);
router.post('/tambah', ctrl.store);
router.get('/:id/edit', ctrl.editForm);
router.post('/:id/edit', ctrl.update);
router.post('/:id/hapus', ctrl.destroy);
=======
router.get('/', paketController.index);
router.get('/tambah', paketController.tambahForm);
router.post('/tambah', uploadGambarPaket, paketController.store);
router.get('/edit/:id', paketController.editForm);
router.post('/edit/:id', uploadGambarPaket, paketController.update);
router.post('/hapus/:id', paketController.destroy);
>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)

module.exports = router;