
const pool = require('../config/db');

async function getAll({ kategori, q } = {}) {
  let sql = 'SELECT * FROM menu WHERE 1=1';
  const params = [];

  if (kategori) {
    sql += ' AND kategori = ?';
    params.push(kategori);
  }

  if (q) {
    sql += ' AND nama_menu LIKE ?';
    params.push(`%${q}%`);
  }

  sql += ' ORDER BY id DESC';

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM menu WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO menu
    (nama_menu, kategori, harga, deskripsi, stok, gambar)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.nama_menu,
      data.kategori,
      data.harga,
      data.deskripsi,
      data.stok,
      data.gambar
    ]
  );

  return result.insertId;
}

async function update(id, data) {
  const [result] = await pool.execute(
    `UPDATE menu SET
      nama_menu = ?,
      kategori = ?,
      harga = ?,
      deskripsi = ?,
      stok = ?,
      gambar = ?
    WHERE id = ?`,
    [
      data.nama_menu,
      data.kategori,
      data.harga,
      data.deskripsi,
      data.stok,
      data.gambar,
      id
    ]
  );

  return result;
}

async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM menu WHERE id = ?',
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
