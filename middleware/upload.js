
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Folder penyimpanan gambar menu
const FOLDER_MENU = path.join(__dirname, '..', 'public', 'uploads', 'menu');
fs.mkdirSync(FOLDER_MENU, { recursive: true });

// Folder penyimpanan gambar paket
const FOLDER_PAKET = path.join(__dirname, '..', 'public', 'uploads', 'paket');
fs.mkdirSync(FOLDER_PAKET, { recursive: true });

// Filter gambar JPG dan PNG
const fileFilter = (req, file, cb) => {
  const extOk = ['.jpg', '.jpeg', '.png'].includes(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeOk = ['image/jpeg', 'image/png'].includes(file.mimetype);

  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Gambar harus berformat JPG atau PNG.'));
};

// Membuat penyimpanan gambar untuk folder tertentu
function buatStorage(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, folder),
    filename: (req, file, cb) => {
      const unik = Date.now() + '-' + Math.round(Math.random() * 1e6);
      cb(null, unik + path.extname(file.originalname).toLowerCase());
    }
  });
}

// Upload gambar menu
const uploadMenu = multer({
  storage: buatStorage(FOLDER_MENU),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Upload gambar paket
const uploadPaket = multer({
  storage: buatStorage(FOLDER_PAKET),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

function prosesUpload(upload, req, next) {
  upload.single('gambar')(req, null, err => {
    if (err) {
      req.uploadError = err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran gambar maksimal 2 MB.'
        : (err.message || 'Gambar gagal diunggah.');
    }
    next();
  });
}

function uploadGambar(req, res, next) {
  uploadMenu.single('gambar')(req, res, err => {
    if (err) {
      req.uploadError = err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran gambar maksimal 2 MB.'
        : (err.message || 'Gambar gagal diunggah.');
    }
    next();
  });
}

function uploadGambarPaket(req, res, next) {
  uploadPaket.single('gambar')(req, res, err => {
    if (err) {
      req.uploadError = err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran gambar maksimal 2 MB.'
        : (err.message || 'Gambar gagal diunggah.');
    }
    next();
  });
}

// Hapus gambar menu
function hapusGambar(namaFile) {
  if (!namaFile || /^https?:\/\//i.test(namaFile)) return;
  fs.unlink(path.join(FOLDER_MENU, path.basename(namaFile)), () => {});
}

// Hapus gambar paket
function hapusGambarPaket(namaFile) {
  if (!namaFile || /^https?:\/\//i.test(namaFile)) return;
  fs.unlink(path.join(FOLDER_PAKET, path.basename(namaFile)), () => {});
}

module.exports = {
  uploadGambar,
  uploadGambarPaket,
  hapusGambar,
  hapusGambarPaket
};
