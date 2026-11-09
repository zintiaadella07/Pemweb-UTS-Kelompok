// Helper format tampilan. Boleh dipakai Orang 3 dan 4:
//   const { rupiah } = require('../helpers/format');
function rupiah(angka) {
  const n = Math.round(Number(angka) || 0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

module.exports = { rupiah };
