
const express = require('express');
const menuController = require('../controllers/menuController');
const { uploadGambar } = require('../middleware/upload');

const router = express.Router();

// Menampilkan daftar menu
router.get('/', menuController.index);

// Form tambah menu
router.get('/tambah', menuController.tambahForm);

// Menyimpan menu baru
router.post('/tambah', uploadGambar, menuController.store);

// Form edit menu
router.get('/edit/:id', menuController.editForm);

// Memperbarui data menu
router.post('/edit/:id', uploadGambar, menuController.update);

// Menghapus menu
router.post('/hapus/:id', menuController.destroy);

module.exports = router;
