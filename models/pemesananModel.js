
const pool = require('../config/db');

// Query utama untuk mengambil data pemesanan beserta pelanggan dan paket.
// Beberapa kolom diberi alias agar tetap cocok dengan controller lama.
const SELECT_JOIN = `
  SELECT
    pm.*,
    pm.id AS id_pemesanan,
    pm.pelanggan_id AS id_pelanggan,
    pm.paket_id AS id_paket,
    pm.tanggal_pengiriman AS tanggal_acara,
    pl.nama AS nama_pelanggan,
    pl.no_hp AS no_telepon,
    pl.email,
    pl.alamat,
    pk.nama_paket,
    pk.harga AS harga_paket,
    pk.deskripsi AS deskripsi_paket,
    pk.kapasitas
  FROM pemesanan pm
  JOIN pelanggan pl ON pl.id = pm.pelanggan_id
  JOIN paket pk ON pk.id = pm.paket_id
`;

const ORDER = `
  ORDER BY pm.tanggal_pemesanan DESC, pm.id DESC
`;

// Mengambil semua data pemesanan dengan filter opsional.
async function getAll({ status, q } = {}) {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('pm.status_pembayaran = ?');
    params.push(status);
  }

  if (q) {
    conditions.push('pl.nama LIKE ?');
    params.push(`%${q}%`);
  }

  const sql =
    SELECT_JOIN +
    (conditions.length ? ' WHERE ' + conditions.join(' AND ') : '') +
    ORDER;

  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Mengambil satu pemesanan berdasarkan ID.
async function getById(id) {
  const [rows] = await pool.execute(
    SELECT_JOIN + ' WHERE pm.id = ?',
    [id]
  );

  return rows[0] || null;
}

// Mengambil riwayat pemesanan pelanggan.
async function getByPelanggan(idPelanggan) {
  const [rows] = await pool.execute(
    SELECT_JOIN + ' WHERE pm.pelanggan_id = ?' + ORDER,
    [idPelanggan]
  );

  return rows;
}

// Mengambil daftar menu dalam satu paket.
async function getIsiPaket(idPaket) {
  const [rows] = await pool.execute(
    `SELECT
       m.nama_menu,
       m.kategori AS kategori_menu,
       pmn.jumlah
     FROM paket_menu pmn
     JOIN menu m ON m.id = pmn.menu_id
     WHERE pmn.paket_id = ?
     ORDER BY m.kategori, m.nama_menu`,
    [idPaket]
  );

  return rows;
}

// Menambahkan pemesanan baru.
async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO pemesanan (
      pelanggan_id,
      paket_id,
      tanggal_pemesanan,
      tanggal_pengiriman,
      jumlah_paket,
      total_harga,
      metode_pembayaran,
      tanggal_pembayaran,
      jumlah_bayar,
      status_pembayaran,
      bukti_pembayaran
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id_pelanggan,
      data.id_paket,
      data.tanggal_pemesanan,
      data.tanggal_acara,
      data.jumlah_paket,
      data.total_harga,
      data.metode_pembayaran || null,
      data.tanggal_pembayaran || null,
      data.jumlah_bayar || 0,
      data.status_pembayaran || 'belum bayar',
      data.bukti_pembayaran || null
    ]
  );

  return result.insertId;
}

// Memperbarui data pemesanan.
async function update(id, data) {
  const [result] = await pool.execute(
    `UPDATE pemesanan SET
      pelanggan_id = ?,
      paket_id = ?,
      tanggal_pengiriman = ?,
      jumlah_paket = ?,
      total_harga = ?,
      metode_pembayaran = ?,
      tanggal_pembayaran = ?,
      jumlah_bayar = ?,
      status_pembayaran = ?,
      bukti_pembayaran = ?
     WHERE id = ?`,
    [
      data.id_pelanggan,
      data.id_paket,
      data.tanggal_acara,
      data.jumlah_paket,
      data.total_harga,
      data.metode_pembayaran || null,
      data.tanggal_pembayaran || null,
      data.jumlah_bayar || 0,
      data.status_pembayaran || 'belum bayar',
      data.bukti_pembayaran || null,
      id
    ]
  );

  return result.affectedRows;
}

// Menghapus pemesanan.
async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM pemesanan WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}

module.exports = {
  getAll,
  getById,
  getByPelanggan,
  getIsiPaket,
  create,
  update,
  remove
};
