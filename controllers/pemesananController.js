// controllers/pemesananController.js  (Refi Wulan Dari)
const fs = require('fs');
const path = require('path');
const pemesananModel = require('../models/pemesananModel');
const pelangganModel = require('../models/pelangganModel');
const paketModel = require('../models/paketModel');
const { rupiah: formatRupiah } = require('../helpers/format'); // helper buatan Orang 2

const STATUS = ['belum bayar', 'lunas'];
const METODE = ['transfer', 'tunai', 'e-wallet'];
const BUKTI_DIR = path.join(__dirname, '..', 'public', 'uploads', 'bukti');

/* ---------- helper ---------- */
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const toInputDate = v => {
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0, 10);
  return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
};
const formatTanggal = v => v
  ? new Date(toInputDate(v) + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  : '-';
const badgeStatus = s => {
  const lunas = s === 'lunas';
  return `<span class="badge ${lunas ? 'badge-lunas' : 'badge-belum'}" style="padding:2px 10px;border-radius:12px;font-size:.85em;color:#fff;background:${lunas ? '#2e9e5b' : '#d9534f'}">${s}</span>`;
};
const isPdf = name => /\.pdf$/i.test(name || '');
const unwrap = r => (Array.isArray(r) ? r[0] : r) || null;
const hapusFile = name => { if (name) fs.unlink(path.join(BUKTI_DIR, name), () => {}); };

// Samakan nama kolom dari database dengan yang dipakai view & buildData
const normPaket = k => k && ({
  ...k,
  id_paket: k.id_paket ?? k.id,
  harga_paket: k.harga_paket ?? k.harga
});
const normPelanggan = p => p && ({
  ...p,
  id_pelanggan: p.id_pelanggan ?? p.id,
  nama_pelanggan: p.nama_pelanggan ?? p.nama
});
// model bisa mengembalikan [rows, fields] atau langsung rows
const toRows = r => (Array.isArray(r) && Array.isArray(r[0]) ? r[0] : r) || [];

const helpers = { formatRupiah, formatTanggal, toInputDate, badgeStatus, isPdf, STATUS, METODE, hariIni: today() };
const render = (req, res, view, data = {}) =>
  res.render(view, { sukses: req.query.sukses || null, error: req.query.error || null, ...helpers, ...data });
const kembali = (res, pesan, tipe = 'sukses') =>
  res.redirect(`/pemesanan?${tipe}=${encodeURIComponent(pesan)}`);

/* ---------- validasi & perhitungan ---------- */
function validate(body, existing) {
  const errors = [];
  if (!body.id_pelanggan) errors.push('Pelanggan wajib dipilih.');
  if (!body.id_paket) errors.push('Paket wajib dipilih.');
  const jumlah = Number(body.jumlah_paket);
  if (!Number.isInteger(jumlah) || jumlah < 1) errors.push('Jumlah paket harus bilangan bulat minimal 1.');
  if (!body.tanggal_acara) {
    errors.push('Tanggal acara wajib diisi.');
  } else if (body.tanggal_acara < today() &&
             !(existing && toInputDate(existing.tanggal_acara) === body.tanggal_acara)) {
    errors.push('Tanggal acara tidak boleh sebelum hari ini.');
  }
  if (!STATUS.includes(body.status_pembayaran)) errors.push('Status pembayaran tidak valid.');
  if (body.metode_pembayaran && !METODE.includes(body.metode_pembayaran)) errors.push('Metode pembayaran tidak valid.');
  if (body.status_pembayaran === 'lunas' && !body.metode_pembayaran) errors.push('Metode pembayaran wajib diisi jika status lunas.');
  return errors;
}

// total_harga SELALU dihitung di server dari harga_paket di database
function buildData(body, paket, bukti) {
  const jumlah = Number(body.jumlah_paket);
  const total = Number(paket.harga_paket) * jumlah;
  const lunas = body.status_pembayaran === 'lunas';
  return {
    id_pelanggan: Number(body.id_pelanggan),
    id_paket: Number(body.id_paket),
    tanggal_pemesanan: today(),
    tanggal_acara: body.tanggal_acara,
    jumlah_paket: jumlah,
    total_harga: total,
    metode_pembayaran: body.metode_pembayaran || null,
    tanggal_pembayaran: lunas ? (body.tanggal_pembayaran || today()) : null,
    jumlah_bayar: lunas ? total : 0,
    status_pembayaran: body.status_pembayaran,
    bukti_pembayaran: bukti || null
  };
}

async function dropdowns() {
  const [pelangganRaw, paketRaw] = await Promise.all([pelangganModel.getAll(), paketModel.getAll()]);
  return {
    pelangganList: toRows(pelangganRaw).map(normPelanggan),
    paketList: toRows(paketRaw).map(normPaket)
  };
}

// cek pelanggan & paket benar-benar ada, tambahkan error kalau tidak
async function lookup(body, errors) {
  const paket = body.id_paket ? normPaket(unwrap(await paketModel.getById(body.id_paket))) : null;
  const pelanggan = body.id_pelanggan ? unwrap(await pelangganModel.getById(body.id_pelanggan)) : null;
  if (body.id_paket && !paket) errors.push('Paket tidak ditemukan.');
  if (body.id_pelanggan && !pelanggan) errors.push('Pelanggan tidak ditemukan.');
  return paket;
}

/* ---------- aksi ---------- */
exports.index = async (req, res, next) => {
  try {
    const status = STATUS.includes(req.query.status) ? req.query.status : '';
    const q = (req.query.q || '').trim();
    const daftar = await pemesananModel.getAll({ status, q });
    render(req, res, 'pemesanan/index', { daftar, status, q });
  } catch (e) { next(e); }
};

exports.tambahForm = async (req, res, next) => {
  try {
    const data = { jumlah_paket: 1, status_pembayaran: 'belum bayar' };
    render(req, res, 'pemesanan/form', { data, errors: [], ...(await dropdowns()) });
  } catch (e) { next(e); }
};

exports.store = async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (req.uploadError) errors.push(req.uploadError);
    const paket = await lookup(req.body, errors);
    if (errors.length) {
      hapusFile(req.file && req.file.filename);
      return render(req, res, 'pemesanan/form', { data: req.body, errors, ...(await dropdowns()) });
    }
    await pemesananModel.create(buildData(req.body, paket, req.file && req.file.filename));
    kembali(res, 'Pemesanan berhasil ditambahkan.');
  } catch (e) { next(e); }
};

exports.show = async (req, res, next) => {
  try {
    const p = await pemesananModel.getById(req.params.id);
    if (!p) return next();
    const isiPaket = await pemesananModel.getIsiPaket(p.id_paket);
    render(req, res, 'pemesanan/detail', { p, isiPaket });
  } catch (e) { next(e); }
};

exports.editForm = async (req, res, next) => {
  try {
    const p = await pemesananModel.getById(req.params.id);
    if (!p) return next();
    const data = { ...p, tanggal_acara: toInputDate(p.tanggal_acara), tanggal_pembayaran: toInputDate(p.tanggal_pembayaran) };
    render(req, res, 'pemesanan/edit', { data, errors: [], ...(await dropdowns()) });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await pemesananModel.getById(id);
    if (!existing) return next();
    const errors = validate(req.body, existing);
    if (req.uploadError) errors.push(req.uploadError);
    const paket = await lookup(req.body, errors);
    if (errors.length) {
      hapusFile(req.file && req.file.filename);
      const data = { ...req.body, id_pemesanan: id, tanggal_pemesanan: existing.tanggal_pemesanan, bukti_pembayaran: existing.bukti_pembayaran };
      return render(req, res, 'pemesanan/edit', { data, errors, ...(await dropdowns()) });
    }
    const bukti = req.file ? req.file.filename : existing.bukti_pembayaran; // tanpa file baru: bukti lama dipertahankan
    await pemesananModel.update(id, buildData(req.body, paket, bukti));
    if (req.file) hapusFile(existing.bukti_pembayaran);
    kembali(res, 'Pemesanan berhasil diperbarui.');
  } catch (e) { next(e); }
};

exports.destroy = async (req, res, next) => {
  try {
    const existing = await pemesananModel.getById(req.params.id);
    if (!existing) return kembali(res, 'Pemesanan tidak ditemukan.', 'error');
    await pemesananModel.remove(req.params.id);
    hapusFile(existing.bukti_pembayaran);
    kembali(res, 'Pemesanan berhasil dihapus.');
  } catch (e) { next(e); }
};

exports.riwayat = async (req, res, next) => {
  try {
    const pelanggan = normPelanggan(unwrap(await pelangganModel.getById(req.params.id)));
    if (!pelanggan) return next();
    const daftar = await pemesananModel.getByPelanggan(req.params.id);
    render(req, res, 'pemesanan/riwayat', { pelanggan, daftar });
  } catch (e) { next(e); }
};