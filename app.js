require('dotenv').config();
const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/indexRoutes'));
app.use('/menu', require('./routes/menuRoutes'));
app.use('/paket', require('./routes/paketRoutes'));
app.use('/pelanggan', require('./routes/pelangganRoutes'));
app.use('/', require('./routes/pemesananRoutes'));

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman tidak ditemukan',
    pesan: 'Halaman yang kamu cari tidak ada.'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Terjadi kesalahan',
    pesan: 'Terjadi kesalahan pada server. Silakan coba lagi.'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
