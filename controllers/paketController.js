const paketModel = require('../models/paketModel');
const { rupiah } = require('../helpers/format');

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
    });
  } catch (err) {
    next(err);
  }
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
        errors
      });
    }

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
      errors: []
    });
  } catch (err) {
    next(err);
  }
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
        errors
      });
    }

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