// models/pemesananModel.js  (Refi Wulan Dari)
const db = require('../config/db');
// Mendukung pool callback (mysql2) maupun pool promise (mysql2/promise)
const pool = typeof db.promise === 'function' ? db.promise() : db;

const SELECT_JOIN = `
  SELECT pm.*,
         pl.nama_pelanggan, pl.no_telepon, pl.email, pl.alamat,
         pk.nama_paket, pk.harga_paket, pk.deskripsi_paket, pk.kapasitas
  FROM pemesanan pm
  JOIN pelanggan pl ON pl.id_pelanggan = pm.id_pelanggan
  JOIN paket pk ON pk.id_paket = pm.id_paket`;

const ORDER = ' ORDER BY pm.tanggal_pemesanan DESC, pm.id_pemesanan DESC';

const COLS = [
  'id_pelanggan', 'id_paket', 'tanggal_pemesanan', 'tanggal_acara',
  'jumlah_paket', 'total_harga', 'metode_pembayaran', 'tanggal_pembayaran',
  'jumlah_bayar', 'status_pembayaran', 'bukti_pembayaran'
];

// filter opsional: { status, q }  (q = nama pelanggan)
async function getAll({ status, q } = {}) {
  const where = [];
  const params = [];
  if (status) { where.push('pm.status_pembayaran = ?'); params.push(status); }
  if (q) { where.push('pl.nama_pelanggan LIKE ?'); params.push(`%${q}%`); }
  const sql = SELECT_JOIN + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ORDER;
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(SELECT_JOIN + ' WHERE pm.id_pemesanan = ?', [id]);
  return rows[0] || null;
}

async function getByPelanggan(idPelanggan) {
  const [rows] = await pool.query(SELECT_JOIN + ' WHERE pm.id_pelanggan = ?' + ORDER, [idPelanggan]);
  return rows;
}

// isi menu dalam satu paket (untuk halaman detail)
async function getIsiPaket(idPaket) {
  const [rows] = await pool.query(
    `SELECT m.nama_menu, m.kategori_menu, pmn.jumlah
     FROM paket_menu pmn JOIN menu m ON m.id_menu = pmn.id_menu
     WHERE pmn.id_paket = ? ORDER BY m.kategori_menu, m.nama_menu`, [idPaket]);
  return rows;
}

async function create(data) {
  const values = COLS.map(c => (data[c] === undefined ? null : data[c]));
  const [res] = await pool.query(
    `INSERT INTO pemesanan (${COLS.join(', ')}) VALUES (?)`, [values]);
  return res.insertId;
}

// tanggal_pemesanan
async function update(id, data) {
  const cols = COLS.filter(c => c !== 'tanggal_pemesanan');
  const sets = cols.map(c => `${c} = ?`).join(', ');
  const values = cols.map(c => (data[c] === undefined ? null : data[c]));
  const [res] = await pool.query(
    `UPDATE pemesanan SET ${sets} WHERE id_pemesanan = ?`, [...values, id]);
  return res.affectedRows;
}

async function remove(id) {
  const [res] = await pool.query('DELETE FROM pemesanan WHERE id_pemesanan = ?', [id]);
  return res.affectedRows;
}

module.exports = { getAll, getById, getByPelanggan, getIsiPaket, create, update, remove };