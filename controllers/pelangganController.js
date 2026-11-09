
const pelangganModel = require('../models/pelangganModel');

// Menampilkan daftar pelanggan
exports.index = async (req, res, next) => {
  try {
    const pelangganList = await pelangganModel.getAll();

    res.render('pelanggan/index', {
      pelangganList,
      pesan: req.query.pesan || null
    });
  } catch (err) {
    next(err);
  }
};

// Menampilkan form tambah
exports.tambahForm = (req, res) => {
  res.render('pelanggan/tambah', {
    data: {},
    errors: []
  });
};

// Menyimpan pelanggan baru
exports.store = async (req, res, next) => {
  try {
    const { nama, no_hp, email, alamat } = req.body;
    const errors = [];

    if (!nama || !nama.trim()) {
      errors.push('Nama pelanggan wajib diisi.');
    } else if (nama.trim().length > 100) {
      errors.push('Nama maksimal 100 karakter.');
    }

    if (!no_hp || !no_hp.trim()) {
      errors.push('Nomor HP wajib diisi.');
    } else if (no_hp.trim().length > 20) {
      errors.push('Nomor HP maksimal 20 karakter.');
    }

    if (email && email.length > 100) {
      errors.push('Email maksimal 100 karakter.');
    }

    if (errors.length > 0) {
      return res.status(400).render('pelanggan/tambah', {
        data: req.body,
        errors
      });
    }

    await pelangganModel.create({
      nama: nama.trim(),
      no_hp: no_hp.trim(),
      email: email || null,
      alamat: alamat || null
    });

    res.redirect('/pelanggan?pesan=Pelanggan berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
};

// Menampilkan form edit
exports.editForm = async (req, res, next) => {
  try {
    const pelanggan = await pelangganModel.getById(req.params.id);

    if (!pelanggan) {
      return res.status(404).render('error', {
        title: 'Pelanggan tidak ditemukan',
        pesan: 'Data pelanggan tidak ditemukan.'
      });
    }

    res.render('pelanggan/edit', {
      data: pelanggan,
      errors: []
    });
  } catch (err) {
    next(err);
  }
};

// Memperbarui pelanggan
exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const pelanggan = await pelangganModel.getById(id);

    if (!pelanggan) {
      return res.status(404).render('error', {
        title: 'Pelanggan tidak ditemukan',
        pesan: 'Data pelanggan tidak ditemukan.'
      });
    }

    const { nama, no_hp, email, alamat } = req.body;
    const errors = [];

    if (!nama || !nama.trim()) {
      errors.push('Nama pelanggan wajib diisi.');
    } else if (nama.trim().length > 100) {
      errors.push('Nama maksimal 100 karakter.');
    }

    if (!no_hp || !no_hp.trim()) {
      errors.push('Nomor HP wajib diisi.');
    } else if (no_hp.trim().length > 20) {
      errors.push('Nomor HP maksimal 20 karakter.');
    }

    if (email && email.length > 100) {
      errors.push('Email maksimal 100 karakter.');
    }

    if (errors.length > 0) {
      return res.status(400).render('pelanggan/edit', {
        data: { ...pelanggan, ...req.body },
        errors
      });
    }

    await pelangganModel.update(id, {
      nama: nama.trim(),
      no_hp: no_hp.trim(),
      email: email || null,
      alamat: alamat || null
    });

    res.redirect('/pelanggan?pesan=Pelanggan berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

// Menghapus pelanggan
exports.destroy = async (req, res, next) => {
  try {
    const pelanggan = await pelangganModel.getById(req.params.id);

    if (!pelanggan) {
      return res.redirect('/pelanggan?pesan=Pelanggan tidak ditemukan');
    }

    await pelangganModel.remove(req.params.id);

    res.redirect('/pelanggan?pesan=Pelanggan berhasil dihapus');
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.redirect(
        '/pelanggan?pesan=Pelanggan tidak bisa dihapus karena masih memiliki pemesanan'
      );
    }

    next(err);
  }
};
