const { pool } = require('../../config/mysql');

// --- VACUNAS ---
async function getAllVacunas() {
  const [rows] = await pool.execute(`
    SELECT 
      v.id,
      v.porcino_id,
      p.identificacion AS porcino_codigo,
      v.nombre_vacuna,
      DATE_FORMAT(v.fecha_aplicacion, '%Y-%m-%d') AS fecha_aplicacion,
      v.estado,
      v.dosis,
      v.proxima_vacuna_dias,
      v.notas
    FROM vacunacion v
    LEFT JOIN porcinos p ON v.porcino_id = p.id OR v.porcino_id = p.identificacion
    ORDER BY v.fecha_aplicacion DESC
  `);
  return rows;
}

async function createVacuna(datos) {
  const { porcino_id, nombre_vacuna, fecha_aplicacion, estado, dosis, proxima_vacuna_dias, notas } = datos;
  const [res] = await pool.execute(`
    INSERT INTO vacunacion (porcino_id, nombre_vacuna, fecha_aplicacion, estado, dosis, proxima_vacuna_dias, notas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    porcino_id,
    nombre_vacuna,
    fecha_aplicacion,
    estado || 'Aplicada',
    dosis || 2.0,
    proxima_vacuna_dias || 14,
    notas || ''
  ]);
  return { id: res.insertId, ...datos };
}

async function deleteVacuna(id) {
  const [res] = await pool.execute('DELETE FROM vacunacion WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// --- ENFERMEDADES ---
async function getAllEnfermedades() {
  const [rows] = await pool.execute(`
    SELECT 
      e.id,
      e.porcino_id,
      p.identificacion AS porcino_codigo,
      e.tipo_enfermedad,
      DATE_FORMAT(e.fecha_diagnostico, '%Y-%m-%d') AS fecha_diagnostico,
      e.tratamiento,
      e.estado
    FROM enfermedades e
    LEFT JOIN porcinos p ON e.porcino_id = p.id OR e.porcino_id = p.identificacion
    ORDER BY e.fecha_diagnostico DESC
  `);
  return rows;
}

async function createEnfermedad(datos) {
  const { porcino_id, tipo_enfermedad, fecha_diagnostico, tratamiento, estado } = datos;
  const [res] = await pool.execute(`
    INSERT INTO enfermedades (porcino_id, tipo_enfermedad, fecha_diagnostico, tratamiento, estado)
    VALUES (?, ?, ?, ?, ?)
  `, [
    porcino_id,
    tipo_enfermedad,
    fecha_diagnostico,
    tratamiento,
    estado || 'En Tratamiento'
  ]);
  return { id: res.insertId, ...datos };
}

async function deleteEnfermedad(id) {
  const [res] = await pool.execute('DELETE FROM enfermedades WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

module.exports = {
  getAllVacunas,
  createVacuna,
  deleteVacuna,
  getAllEnfermedades,
  createEnfermedad,
  deleteEnfermedad
};
