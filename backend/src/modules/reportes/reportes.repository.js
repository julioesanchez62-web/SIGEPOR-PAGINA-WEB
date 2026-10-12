const { pool } = require('../../config/mysql');

async function getAlertasSistema() {
  const [porcinosEnfermos] = await pool.execute("SELECT id, identificacion, raza, estado_salud FROM porcinos WHERE estado_salud = 'Enfermo' OR estado_salud = 'En Observación'");
  const [partosProximos] = await pool.execute("SELECT e.id, e.porcino_id, p.identificacion, DATE_FORMAT(e.fecha_probable_parto, '%Y-%m-%d') AS fecha_probable_parto FROM eventos_reproductivos e LEFT JOIN porcinos p ON e.porcino_id = p.id WHERE e.tipo_evento = 'Cubrición' AND e.fecha_probable_parto >= CURRENT_DATE()");
  const [vacunasPendientes] = await pool.execute("SELECT v.id, v.porcino_id, p.identificacion, v.nombre_vacuna, DATE_FORMAT(v.fecha_aplicacion, '%Y-%m-%d') AS fecha_aplicacion FROM vacunacion v LEFT JOIN porcinos p ON v.porcino_id = p.id WHERE v.estado = 'Pendiente' OR v.estado = 'Retrasada'");

  return {
    salud: porcinosEnfermos,
    reproduccion: partosProximos,
    vacunacion: vacunasPendientes
  };
}

async function getTrazabilidadPorcino(id) {
  const [porcino] = await pool.execute("SELECT * FROM porcinos WHERE id = ? OR identificacion = ? LIMIT 1", [id, id]);
  if (!porcino[0]) return null;

  const targetId = porcino[0].id;
  const targetCodigo = porcino[0].identificacion;

  const [vacunas] = await pool.execute("SELECT * FROM vacunacion WHERE porcino_id = ? OR porcino_id = ?", [targetId, targetCodigo]);
  const [enfermedades] = await pool.execute("SELECT * FROM enfermedades WHERE porcino_id = ? OR porcino_id = ?", [targetId, targetCodigo]);
  const [reproduccion] = await pool.execute("SELECT * FROM eventos_reproductivos WHERE porcino_id = ? OR porcino_id = ?", [targetId, targetCodigo]);

  return {
    porcino: porcino[0],
    historial: {
      vacunas,
      enfermedades,
      reproduccion
    }
  };
}

module.exports = {
  getAlertasSistema,
  getTrazabilidadPorcino
};
