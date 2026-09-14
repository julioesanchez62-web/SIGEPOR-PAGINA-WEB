const { pool } = require('../../config/mysql');

async function getAllEventos() {
  const [rows] = await pool.execute(`
    SELECT 
      e.id,
      e.porcino_id,
      p.identificacion AS porcino_codigo,
      p.raza AS porcino_raza,
      e.tipo_evento,
      DATE_FORMAT(e.fecha_evento, '%Y-%m-%d') AS fecha_evento,
      DATE_FORMAT(e.fecha_probable_parto, '%Y-%m-%d') AS fecha_probable_parto,
      e.lechones_nacidos,
      e.observaciones
    FROM eventos_reproductivos e
    LEFT JOIN porcinos p ON e.porcino_id = p.id OR e.porcino_id = p.identificacion
    ORDER BY e.fecha_evento DESC
  `);
  return rows;
}

async function getEventoById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      e.id,
      e.porcino_id,
      p.identificacion AS porcino_codigo,
      e.tipo_evento,
      DATE_FORMAT(e.fecha_evento, '%Y-%m-%d') AS fecha_evento,
      DATE_FORMAT(e.fecha_probable_parto, '%Y-%m-%d') AS fecha_probable_parto,
      e.lechones_nacidos,
      e.observaciones
    FROM eventos_reproductivos e
    LEFT JOIN porcinos p ON e.porcino_id = p.id OR e.porcino_id = p.identificacion
    WHERE e.id = ?
    LIMIT 1
  `, [id]);
  return rows[0] || null;
}

async function createEvento(datos) {
  const { porcino_id, tipo_evento, fecha_evento, fecha_probable_parto, lechones_nacidos, observaciones } = datos;
  const [res] = await pool.execute(`
    INSERT INTO eventos_reproductivos (porcino_id, tipo_evento, fecha_evento, fecha_probable_parto, lechones_nacidos, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    porcino_id,
    tipo_evento,
    fecha_evento,
    fecha_probable_parto || null,
    lechones_nacidos || 0,
    observaciones || ''
  ]);

  return await getEventoById(res.insertId);
}

async function deleteEvento(id) {
  const [res] = await pool.execute('DELETE FROM eventos_reproductivos WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

module.exports = {
  getAllEventos,
  getEventoById,
  createEvento,
  deleteEvento
};
