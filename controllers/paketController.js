const paketModel = require('../models/paketModel');
const { rupiah } = require('../helpers/format');
<<<<<<< HEAD

const PESAN = {
  tambah: 'Paket berhasil ditambahkan.',
  ubah: 'Paket berhasil diperbarui.',
  hapus: 'Paket berhasil dihapus.',
  dipakai: 'Paket tidak bisa dihapus karena masih dipakai oleh data lain.'
};

function tidakDitemukan(res) {
  return res.status(404).render('error', {
    title: 'Paket tidak ditemukan',
    pesan: 'Paket yang kamu cari tidak ada.'
  });
}

function validasi(req) {
  const body = req.body || {};
  const errors = [];
  const data = {
    nama_paket: (body.nama_paket || '').trim(),
    harga: Number(body.harga),
    deskripsi: (body.deskripsi || '').trim() || null
  };

  if (!data.nama_paket) errors.push('Nama paket wajib diisi.');
  else if (data.nama_paket.length > 100) errors.push('Nama paket maksimal 100 karakter.');

  if (body.harga === undefined || body.harga === '' || Number.isNaN(data.harga) || data.harga <= 0) {
    errors.push('Harga harus berupa angka lebih dari 0.');
  }

  return { errors, data };
}

async function index(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const pakets = await paketModel.getAll({ q });
    res.render('paket/index', {
      title: 'Daftar Paket',
      pakets,
      filter: { q },
      rupiah,
      pesan: PESAN[req.query.status] || null
=======
const { hapusGambarPaket } = require('../middleware/upload');

function halamanError(res, pesan) {
  return res.status(400).render('error', {
    title: 'Terjadi kesalahan',
    pesan
  });
}

// Menampilkan semua paket
exports.index = async (req, res, next) => {
  try {
    const pakets = await paketModel.getAll();

    res.render('paket/index', {
      pakets,
      rupiah,
      pesan: req.query.pesan || null
>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)
    });
  } catch (err) {
    next(err);
  }
<<<<<<< HEAD
}

function tambahForm(req, res) {
  res.render('paket/tambah', {
    title: 'Tambah Paket',
    paket: {},
    errors: []
  });
}

async function store(req, res, next) {
  try {
    const { errors, data } = validasi(req);

    if (errors.length > 0) {
      return res.status(400).render('paket/tambah', {
        title: 'Tambah Paket',
        paket: req.body,
=======
};

// Form tambah paket
exports.tambahForm = (req, res) => {
  res.render('paket/tambah', {
    data: {},
    errors: []
  });
};

// Menyimpan paket baru
exports.store = async (req, res, next) => {
  try {
    const { nama_paket, deskripsi, harga, kapasitas } = req.body;
    const errors = [];

    if (!nama_paket || !nama_paket.trim()) {
      errors.push('Nama paket wajib diisi.');
    }

    if (!harga || Number(harga) <= 0) {
      errors.push('Harga harus lebih dari 0.');
    }

    if (!Number.isInteger(Number(kapasitas)) || Number(kapasitas) < 1) {
      errors.push('Kapasitas minimal 1.');
    }

    if (req.uploadError) errors.push(req.uploadError);

    if (errors.length) {
      if (req.file) hapusGambarPaket(req.file.filename);
      return res.status(400).render('paket/tambah', {
        data: req.body,
>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)
        errors
      });
    }

<<<<<<< HEAD
    await paketModel.create(data);
    res.redirect('/paket?status=tambah');
  } catch (err) {
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const paket = await paketModel.getById(req.params.id);
    if (!paket) return tidakDitemukan(res);
    res.render('paket/edit', {
      title: 'Edit Paket',
      paket,
=======
    await paketModel.create({
      nama_paket: nama_paket.trim(),
      deskripsi: deskripsi || null,
      harga: Number(harga),
      kapasitas: Number(kapasitas),
      tersedia: req.body.tersedia === '0' ? 0 : 1,
      gambar: req.file ? req.file.filename : null
    });

    res.redirect('/paket?pesan=Paket berhasil ditambahkan');
  } catch (err) {
    if (req.file) hapusGambarPaket(req.file.filename);
    next(err);
  }
};

// Form edit paket
exports.editForm = async (req, res, next) => {
  try {
    const paket = await paketModel.getById(req.params.id);

    if (!paket) {
      return halamanError(res, 'Paket tidak ditemukan.');
    }

    res.render('paket/edit', {
      data: paket,
>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)
      errors: []
    });
  } catch (err) {
    next(err);
  }
<<<<<<< HEAD
}

async function update(req, res, next) {
  try {
    const lama = await paketModel.getById(req.params.id);
    if (!lama) return tidakDitemukan(res);

    const { errors, data } = validasi(req);

    if (errors.length > 0) {
      return res.status(400).render('paket/edit', {
        title: 'Edit Paket',
        paket: { ...req.body, id: lama.id },
=======
};

// Memperbarui paket
exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const lama = await paketModel.getById(id);

    if (!lama) {
      if (req.file) hapusGambarPaket(req.file.filename);
      return halamanError(res, 'Paket tidak ditemukan.');
    }

    const { nama_paket, deskripsi, harga, kapasitas } = req.body;
    const errors = [];

    if (!nama_paket || !nama_paket.trim()) {
      errors.push('Nama paket wajib diisi.');
    }

    if (!harga || Number(harga) <= 0) {
      errors.push('Harga harus lebih dari 0.');
    }

    if (!Number.isInteger(Number(kapasitas)) || Number(kapasitas) < 1) {
      errors.push('Kapasitas minimal 1.');
    }

    if (req.uploadError) errors.push(req.uploadError);

    if (errors.length) {
      if (req.file) hapusGambarPaket(req.file.filename);
      return res.status(400).render('paket/edit', {
        data: { ...lama, ...req.body },
>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)
        errors
      });
    }

<<<<<<< HEAD
    await paketModel.update(req.params.id, data);
    res.redirect('/paket?status=ubah');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const paket = await paketModel.getById(req.params.id);
    if (!paket) return tidakDitemukan(res);

    await paketModel.remove(req.params.id);
    res.redirect('/paket?status=hapus');
  } catch (err) {
    // Paket masih dipakai tabel lain (misalnya pemesanan) -> ditolak oleh foreign key
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.redirect('/paket?status=dipakai');
    }
    next(err);
  }
}

module.exports = { index, tambahForm, store, editForm, update, destroy };
=======
    await paketModel.update(id, {
      nama_paket: nama_paket.trim(),
      deskripsi: deskripsi || null,
      harga: Number(harga),
      kapasitas: Number(kapasitas),
      tersedia: req.body.tersedia === '0' ? 0 : 1,
      gambar: req.file ? req.file.filename : lama.gambar
    });

    if (req.file && lama.gambar) {
      hapusGambarPaket(lama.gambar);
    }

    res.redirect('/paket?pesan=Paket berhasil diperbarui');
  } catch (err) {
    if (req.file) hapusGambarPaket(req.file.filename);
    next(err);
  }
};

// Menghapus paket
exports.destroy = async (req, res, next) => {
  try {
    const paket = await paketModel.getById(req.params.id);

    if (!paket) {
      return halamanError(res, 'Paket tidak ditemukan.');
    }

    await paketModel.remove(req.params.id);

    if (paket.gambar) hapusGambarPaket(paket.gambar);

    res.redirect('/paket?pesan=Paket berhasil dihapus');
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return halamanError(
        res,
        'Paket tidak bisa dihapus karena masih digunakan dalam pemesanan.'
      );
    }
    next(err);
  }
};
>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)
