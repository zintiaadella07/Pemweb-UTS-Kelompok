
const pool = require('../config/db');

async function getMenuByPaket(paketId) {
  const [rows] = await pool.execute(
    `SELECT m.* FROM paket_menu pm
     JOIN menu m ON m.id = pm.menu_id
     WHERE pm.paket_id = ?`,
    [paketId]
  );
  return rows;
}

async function add(paketId, menuId) {
  await pool.execute(
    'INSERT INTO paket_menu (paket_id, menu_id) VALUES (?, ?)',
    [paketId, menuId]
  );
}

async function remove(paketId, menuId) {
  await pool.execute(
    'DELETE FROM paket_menu WHERE paket_id = ? AND menu_id = ?',
    [paketId, menuId]
  );
}

module.exports = { getMenuByPaket, add, remove };
