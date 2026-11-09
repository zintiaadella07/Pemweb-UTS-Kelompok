const multer = require('multer');
const path = require('path');
const fs = require('fs');

const FOLDER_MENU = path.join(__dirname, '..', 'public', 'uploads', 'menu');
fs.mkdirSync(FOLDER_MENU, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FOLDER_MENU),
  filename: (req, file, cb) => {
    const unik = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unik + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  const extOk = ['.jpg', '.jpeg', '.png'].includes(path.extname(file.originalname).toLowerCase());
  const mimeOk = ['image/jpeg', 'image/png'].includes(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Gambar harus berformat JPG atau PNG.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});

// Error upload tidak membuat server error: pesannya disimpan di req.uploadError
// lalu ditampilkan controller bersama pesan validasi lainnya.
function uploadGambar(req, res, next) {
  upload.single('gambar')(req, res, (err) => {
    if (err) {
      req.uploadError = err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran gambar maksimal 2 MB.'
        : (err.message || 'Gambar gagal diunggah.');
    }
    next();
  });
}

// Hapus file gambar menu dari disk (aman: hanya nama file, bukan path / URL).
function hapusGambar(namaFile) {
  if (!namaFile || /^https?:\/\//i.test(namaFile)) return;
  fs.unlink(path.join(FOLDER_MENU, path.basename(namaFile)), () => {});
}

module.exports = { uploadGambar, hapusGambar };
