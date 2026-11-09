const pool = require('../config/db');

<<<<<<< HEAD
async function getAll({ q = '' } = {}) {
  let sql = 'SELECT * FROM paket';
  const params = [];
  if (q) {
    sql += ' WHERE nama_paket LIKE ?';
    params.push('%' + q + '%');
  }
  sql += ' ORDER BY id DESC';
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.execute('SELECT * FROM paket WHERE id = ?', [id]);
  return rows[0];
}

async function create(data) {
  const [hasil] = await pool.execute(
    'INSERT INTO paket (nama_paket, harga, deskripsi) VALUES (?, ?, ?)',
    [data.nama_paket, data.harga, data.deskripsi]
  );
  return hasil.insertId;
}

async function update(id, data) {
  await pool.execute(
    'UPDATE paket SET nama_paket = ?, harga = ?, deskripsi = ? WHERE id = ?',
    [data.nama_paket, data.harga, data.deskripsi, id]
  );
}

async function remove(id) {
  await pool.execute('DELETE FROM paket WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
=======
// Mengambil semua paket
async function getAll() {
  const [rows] = await pool.execute(`
    SELECT *
    FROM paket
    ORDER BY id DESC
  `);
  return rows;
}

// Mengambil paket berdasarkan ID
async function getById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM paket WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// Menambahkan paket
async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO paket
    (nama_paket, deskripsi, harga, kapasitas, tersedia, gambar)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.nama_paket,
      data.deskripsi,
      data.harga,
      data.kapasitas,
      data.tersedia,
      data.gambar || null
    ]
  );
  return result.insertId;
}

// Mengubah paket
async function update(id, data) {
  const [result] = await pool.execute(
    `UPDATE paket SET
      nama_paket = ?,
      deskripsi = ?,
      harga = ?,
      kapasitas = ?,
      tersedia = ?,
      gambar = ?
    WHERE id = ?`,
    [
      data.nama_paket,
      data.deskripsi,
      data.harga,
      data.kapasitas,
      data.tersedia,
      data.gambar || null,
      id
    ]
  );
  return result;
}

// Menghapus paket
async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM paket WHERE id = ?',
    [id]
  );
  return result;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
>>>>>>> ef12c33 (Perbaikan upload dan tampilan gambar menu dan paket)
