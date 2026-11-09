const pool = require('../config/db');

// Semua query memakai SQL statis + tanda penampung (?). Tidak ada ${} atau
// penggabungan string pada SQL. Filter opsional ditangani lewat kondisi
// (? = '' OR ...) sehingga teks query-nya selalu tetap.

// filter opsional: { kategori, q } -> untuk ?kategori= dan pencarian nama
async function getAll(filter = {}) {
  const kategori = filter.kategori || '';
  const q = filter.q || '';

  const [rows] = await pool.execute(
    `SELECT id, nama_menu, kategori, harga, deskripsi, stok, gambar
      FROM menu
      WHERE (? = '' OR kategori = ?)
        AND (? = '' OR nama_menu LIKE CONCAT('%', ?, '%'))
      ORDER BY id DESC`,
    [kategori, kategori, q, q]
  );
  return rows;
}

async function getById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nama_menu, kategori, harga, deskripsi, stok, gambar FROM menu WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    'INSERT INTO menu (nama_menu, kategori, harga, deskripsi, stok, gambar) VALUES (?, ?, ?, ?, ?, ?)',
    [data.nama_menu, data.kategori, data.harga, data.deskripsi, data.stok, data.gambar]
  );
  return result.insertId;
}

async function update(id, data) {
  const [result] = await pool.execute(
    'UPDATE menu SET nama_menu = ?, kategori = ?, harga = ?, deskripsi = ?, stok = ?, gambar = ? WHERE id = ?',
    [data.nama_menu, data.kategori, data.harga, data.deskripsi, data.stok, data.gambar, id]
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM menu WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = { getAll, getById, create, update, remove };