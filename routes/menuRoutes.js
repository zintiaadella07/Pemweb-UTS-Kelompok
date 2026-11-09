const express = require('express');
const menuController = require('../controllers/menuController');
const { uploadGambar } = require('../middleware/upload');

const router = express.Router();

router.get('/', menuController.index);
router.get('/tambah', menuController.tambahForm);
router.post('/tambah', uploadGambar, menuController.store);
router.get('/edit/:id', menuController.editForm);
router.post('/edit/:id', uploadGambar, menuController.update);
router.post('/hapus/:id', menuController.destroy);

module.exports = router;
