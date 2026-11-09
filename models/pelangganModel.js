
const pool = require('../config/db');

// Menampilkan semua pelanggan
async function getAll() {
  const [rows] = await pool.execute(`
    SELECT
      id AS id_pelanggan,
      nama AS nama_pelanggan,
      no_hp AS no_telepon,
      email,
      alamat
    FROM pelanggan
    ORDER BY id DESC
  `);

  return rows;
}

// Mengambil pelanggan berdasarkan ID
async function getById(id) {
  const [rows] = await pool.execute(`
    SELECT
      id AS id_pelanggan,
      nama AS nama_pelanggan,
      no_hp AS no_telepon,
      email,
      alamat
    FROM pelanggan
    WHERE id = ?
  `, [id]);

  return rows[0] || null;
}

// Menambahkan pelanggan
async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO pelanggan (nama, no_hp, email, alamat)
    VALUES (?, ?, ?, ?)
  `, [
    data.nama,
    data.no_hp,
    data.email || null,
    data.alamat || null
  ]);

  return result.insertId;
}

// Mengubah pelanggan
async function update(id, data) {
  const [result] = await pool.execute(`
    UPDATE pelanggan
    SET nama = ?, no_hp = ?, email = ?, alamat = ?
    WHERE id = ?
  `, [
    data.nama,
    data.no_hp,
    data.email || null,
    data.alamat || null,
    id
  ]);

  return result;
}

// Menghapus pelanggan
async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM pelanggan WHERE id = ?',
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
