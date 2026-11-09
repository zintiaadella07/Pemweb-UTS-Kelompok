// routes/pemesananRoutes.js  (Refi Wulan Dari)
// Semua path ditulis lengkap, jadi di app.js pasang dengan:  app.use('/', pemesananRoutes);
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const c = require('../controllers/pemesananController');

const router = express.Router();

const dir = path.join(__dirname, '..', 'public', 'uploads', 'bukti');
fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) =>
      cb(null, `bukti-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const okExt = ['.jpg', '.jpeg', '.png', '.pdf'].includes(path.extname(file.originalname).toLowerCase());
    const okMime = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype);
    okExt && okMime ? cb(null, true) : cb(new Error('Bukti pembayaran harus berformat JPG, PNG, atau PDF.'));
  }
});

// error upload tidak menghentikan request; controller menampilkannya di form
function uploadBukti(req, res, next) {
  upload.single('bukti_pembayaran')(req, res, err => {
    if (err) req.uploadError = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran bukti pembayaran maksimal 2 MB.' : err.message;
    next();
  });
}

router.get('/pemesanan', c.index);
router.get('/pemesanan/tambah', c.tambahForm);   // harus sebelum /:id
router.post('/pemesanan', uploadBukti, c.store);
router.get('/pemesanan/:id', c.show);
router.get('/pemesanan/:id/edit', c.editForm);
router.put('/pemesanan/:id', uploadBukti, c.update);
router.delete('/pemesanan/:id', c.destroy);
router.get('/pelanggan/:id/riwayat', c.riwayat);

module.exports = router;