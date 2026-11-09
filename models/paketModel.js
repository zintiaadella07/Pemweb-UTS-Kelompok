const pool = require('../config/db');

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