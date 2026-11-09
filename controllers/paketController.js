const paketModel = require('../models/paketModel');
const { rupiah } = require('../helpers/format');
const { hapusGambarPaket } = require('../middleware/upload');
const pool = require('../config/db');

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
    deskripsi: (body.deskripsi || '').trim() || null,
    kapasitas: Number(body.kapasitas),
    tersedia: body.tersedia === '0' ? 0 : 1
  };

  if (!data.nama_paket) {
    errors.push('Nama paket wajib diisi.');
  } else if (data.nama_paket.length > 100) {
    errors.push('Nama paket maksimal 100 karakter.');
  }

  if (
    body.harga === undefined ||
    body.harga === '' ||
    Number.isNaN(data.harga) ||
    data.harga <= 0
  ) {
    errors.push('Harga harus berupa angka lebih dari 0.');
  }

  if (
    body.kapasitas === undefined ||
    body.kapasitas === '' ||
    !Number.isInteger(data.kapasitas) ||
    data.kapasitas < 1
  ) {
    errors.push('Kapasitas minimal 1.');
  }

  return { errors, data };
}

// Menampilkan daftar paket
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
    });
  } catch (err) {
    next(err);
  }
}

// Form tambah paket
function tambahForm(req, res) {
  res.render('paket/tambah', {
    title: 'Tambah Paket',
    paket: {},
    data: {},
    errors: []
  });
}

// Menyimpan paket baru
async function store(req, res, next) {
  try {
    const { errors, data } = validasi(req);

    if (req.uploadError) {
      errors.push(req.uploadError);
    }

    if (errors.length > 0) {
      if (req.file) hapusGambarPaket(req.file.filename);

      return res.status(400).render('paket/tambah', {
        title: 'Tambah Paket',
        paket: req.body,
        data: req.body,
        errors
      });
    }

    data.gambar = req.file ? req.file.filename : null;

    await paketModel.create(data);

    res.redirect('/paket?status=tambah');
  } catch (err) {
    if (req.file) hapusGambarPaket(req.file.filename);
    next(err);
  }
}

// Form edit paket
async function editForm(req, res, next) {
  try {
    const paket = await paketModel.getById(req.params.id);

    if (!paket) return tidakDitemukan(res);

    res.render('paket/edit', {
      title: 'Edit Paket',
      paket,
      data: paket,
      errors: []
    });
  } catch (err) {
    next(err);
  }
}

// Memperbarui paket
async function update(req, res, next) {
  try {
    const id = req.params.id;
    const lama = await paketModel.getById(id);

    if (!lama) {
      if (req.file) hapusGambarPaket(req.file.filename);
      return tidakDitemukan(res);
    }

    const { errors, data } = validasi(req);

    if (req.uploadError) {
      errors.push(req.uploadError);
    }

    if (errors.length > 0) {
      if (req.file) hapusGambarPaket(req.file.filename);

      return res.status(400).render('paket/edit', {
        title: 'Edit Paket',
        paket: { ...lama, ...req.body },
        data: { ...lama, ...req.body },
        errors
      });
    }

    data.gambar = req.file ? req.file.filename : lama.gambar;

    await paketModel.update(id, data);

    if (req.file && lama.gambar) {
      hapusGambarPaket(lama.gambar);
    }

    res.redirect('/paket?status=ubah');
  } catch (err) {
    if (req.file) hapusGambarPaket(req.file.filename);
    next(err);
  }
}

// Menghapus paket
async function destroy(req, res, next) {
  try {
    const id = req.params.id;
    const paket = await paketModel.getById(id);

    if (!paket) return tidakDitemukan(res);

    // Paket yang sudah pernah dipesan tidak boleh dihapus
    const [pakai] = await pool.execute(
      'SELECT COUNT(*) AS total FROM pemesanan WHERE paket_id = ?',
      [id]
    );
    if (pakai[0].total > 0) {
      return res.redirect('/paket?status=dipakai');
    }

    // Hapus isi paket dulu, baru paketnya
    await pool.execute('DELETE FROM paket_menu WHERE paket_id = ?', [id]);
    await paketModel.remove(id);

    if (paket.gambar) {
      hapusGambarPaket(paket.gambar);
    }

    res.redirect('/paket?status=hapus');
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.redirect('/paket?status=dipakai');
    }

    next(err);
  }
}

module.exports = {
  index,
  tambahForm,
  store,
  editForm,
  update,
  destroy
};