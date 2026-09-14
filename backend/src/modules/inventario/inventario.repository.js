const { pool } = require('../../config/mysql');

// --- ALIMENTACION ---
async function getAlimentos() {
  const [rows] = await pool.execute(`
    SELECT id, tipo_alimento, cantidad, DATE_FORMAT(fecha_suministro, '%Y-%m-%d') AS fecha_suministro, proveedor, corral
    FROM alimentacion
    ORDER BY fecha_suministro DESC
  `);
  return rows;
}

async function createAlimento(datos) {
  const { tipo_alimento, cantidad, fecha_suministro, proveedor, corral } = datos;
  const [res] = await pool.execute(`
    INSERT INTO alimentacion (tipo_alimento, cantidad, fecha_suministro, proveedor, corral)
    VALUES (?, ?, ?, ?, ?)
  `, [tipo_alimento, cantidad, fecha_suministro, proveedor || '', corral || '']);
  return { id: res.insertId, ...datos };
}

async function deleteAlimento(id) {
  const [res] = await pool.execute('DELETE FROM alimentacion WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// --- CORRALES ---
async function getCorrales() {
  const [rows] = await pool.execute('SELECT * FROM corrales ORDER BY id ASC');
  return rows;
}

async function createCorral(datos) {
  const { nombre, capacidad, tipo_alimentacion, estado_limpieza, ubicacion } = datos;
  const [res] = await pool.execute(`
    INSERT INTO corrales (nombre, capacidad, tipo_alimentacion, estado_limpieza, ubicacion)
    VALUES (?, ?, ?, ?, ?)
  `, [nombre, capacidad || 10, tipo_alimentacion || 'Balanceado', estado_limpieza || 'Limpio', ubicacion || 'Granja Principal']);
  return { id: res.insertId, ...datos };
}

// --- PROVEEDORES ---
async function getProveedores() {
  const [rows] = await pool.execute('SELECT * FROM proveedores ORDER BY nombre ASC');
  return rows;
}

async function createProveedor(datos) {
  const { nombre, telefono, email, direccion } = datos;
  const [res] = await pool.execute(`
    INSERT INTO proveedores (nombre, telefono, email, direccion)
    VALUES (?, ?, ?, ?)
  `, [nombre, telefono || '', email || '', direccion || '']);
  return { id: res.insertId, ...datos };
}

module.exports = {
  getAlimentos,
  createAlimento,
  deleteAlimento,
  getCorrales,
  createCorral,
  getProveedores,
  createProveedor
};
