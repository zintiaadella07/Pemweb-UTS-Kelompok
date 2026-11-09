
const express = require('express');
const paketController = require('../controllers/paketController');
const { uploadGambarPaket } = require('../middleware/upload');

const router = express.Router();

// Menampilkan daftar paket
router.get('/', paketController.index);

// Form tambah paket
router.get('/tambah', paketController.tambahForm);

// Menyimpan paket baru
router.post('/tambah', uploadGambarPaket, paketController.store);

// Form edit paket
router.get('/edit/:id', paketController.editForm);

// Memperbarui data paket
router.post('/edit/:id', uploadGambarPaket, paketController.update);

// Menghapus paket
router.post('/hapus/:id', paketController.destroy);

module.exports = router;
