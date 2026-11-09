const menuModel = require('../models/menuModel');
const { hapusGambar } = require('../middleware/upload');
const { rupiah } = require('../helpers/format');

const KATEGORI = ['Makanan', 'Minuman'];

const PESAN = {
  tambah: 'Menu berhasil ditambahkan.',
  ubah: 'Menu berhasil diperbarui.',
  hapus: 'Menu berhasil dihapus.',
  dipakai: 'Menu tidak bisa dihapus karena masih dipakai oleh paket.'
};

function tidakDitemukan(res) {
  return res.status(404).render('error', {
    title: 'Menu tidak ditemukan',
    pesan: 'Menu yang kamu cari tidak ada.'
  });
}

function validasi(req) {
  const body = req.body || {};
  const errors = [];
  const data = {
    nama_menu: (body.nama_menu || '').trim(),
    kategori: body.kategori,
    harga: Number(body.harga),
    deskripsi: (body.deskripsi || '').trim() || null,
    stok: Number(body.stok)
  };

  if (!data.nama_menu) errors.push('Nama menu wajib diisi.');
  else if (data.nama_menu.length > 100) errors.push('Nama menu maksimal 100 karakter.');

  if (!KATEGORI.includes(data.kategori)) {
    errors.push('Kategori harus salah satu dari: ' + KATEGORI.join(', ') + '.');
  }

  // Harga harus LEBIH dari 0
  if (body.harga === undefined || body.harga === '' || Number.isNaN(data.harga) || data.harga <= 0) {
    errors.push('Harga harus berupa angka lebih dari 0.');
  }

  // Stok tidak boleh negatif
  if (body.stok === undefined || body.stok === '' || !Number.isInteger(data.stok) || data.stok < 0) {
    errors.push('Stok harus berupa bilangan bulat 0 atau lebih.');
  }

  if (req.uploadError) errors.push(req.uploadError);

  return { errors, data };
}

async function index(req, res, next) {
  try {
    const kategori = KATEGORI.includes(req.query.kategori) ? req.query.kategori : '';
    const q = (req.query.q || '').trim();

    const menus = await menuModel.getAll({ kategori, q });
    res.render('menu/index', {
      title: 'Daftar Menu',
      menus,
      kategoriList: KATEGORI,
      filter: { kategori, q },
      rupiah,
      pesan: PESAN[req.query.status] || null
    });
  } catch (err) {
    next(err);
  }
}

function tambahForm(req, res) {
  res.render('menu/tambah', {
    title: 'Tambah Menu',
    menu: { kategori: 'Makanan', stok: 0 },
    kategoriList: KATEGORI,
    errors: []
  });
}

async function store(req, res, next) {
  try {
    const { errors, data } = validasi(req);

    if (errors.length > 0) {
      if (req.file) hapusGambar(req.file.filename); // jangan sisakan file yatim
      return res.status(400).render('menu/tambah', {
        title: 'Tambah Menu',
        menu: req.body,
        kategoriList: KATEGORI,
        errors
      });
    }

    data.gambar = req.file ? req.file.filename : null;
    await menuModel.create(data);
    res.redirect('/menu?status=tambah');
  } catch (err) {
    if (req.file) hapusGambar(req.file.filename);
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const menu = await menuModel.getById(req.params.id);
    if (!menu) return tidakDitemukan(res);
    res.render('menu/edit', {
      title: 'Edit Menu',
      menu,
      kategoriList: KATEGORI,
      errors: []
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const lama = await menuModel.getById(req.params.id);
    if (!lama) {
      if (req.file) hapusGambar(req.file.filename);
      return tidakDitemukan(res);
    }

    const { errors, data } = validasi(req);

    if (errors.length > 0) {
      if (req.file) hapusGambar(req.file.filename);
      return res.status(400).render('menu/edit', {
        title: 'Edit Menu',
        menu: { ...req.body, id: lama.id, gambar: lama.gambar },
        kategoriList: KATEGORI,
        errors
      });
    }

    // Tidak ada gambar baru -> gambar lama dipertahankan
    data.gambar = req.file ? req.file.filename : lama.gambar;

    await menuModel.update(req.params.id, data);

    // File gambar lama dihapus dari disk hanya jika sudah diganti
    if (req.file && lama.gambar) hapusGambar(lama.gambar);

    res.redirect('/menu?status=ubah');
  } catch (err) {
    if (req.file) hapusGambar(req.file.filename);
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const menu = await menuModel.getById(req.params.id);
    if (!menu) return tidakDitemukan(res);

    await menuModel.remove(req.params.id);
    hapusGambar(menu.gambar);
    res.redirect('/menu?status=hapus');
  } catch (err) {
    // FK paket_menu.menu_id = ON DELETE RESTRICT -> menu masih dipakai paket
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.redirect('/menu?status=dipakai');
    }
    next(err);
  }
}

module.exports = { index, tambahForm, store, editForm, update, destroy };
