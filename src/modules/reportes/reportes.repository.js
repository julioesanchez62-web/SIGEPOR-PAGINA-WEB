const { pool } = require('../../config/mysql');

/**
 * Obtener alertas sanitarias, reproductivas y operativas del sistema en tiempo real
 */
async function getAlertasSistema() {
  // 1. Salud General: Porcinos con estado de salud no óptimo
  const [porcinosSalud] = await pool.execute(`
    SELECT 
      id_porcino, 
      id_porcino AS id, 
      identificacion, 
      raza, 
      estado_salud,
      DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha
    FROM porcinos 
    WHERE LOWER(estado_salud) != 'saludable' AND LOWER(estado_salud) != 'sano'
    ORDER BY id_porcino DESC
  `);

  // 2. Módulo de Sanidad: Diagnósticos de enfermedades activas o en tratamiento
  const [enfermedadesActivas] = await pool.execute(`
    SELECT 
      e.id, 
      e.porcino_id, 
      COALESCE(p.identificacion, CONCAT('ID-', e.porcino_id)) AS identificacion, 
      e.tipo_enfermedad, 
      e.tratamiento, 
      e.estado,
      DATE_FORMAT(e.fecha_diagnostico, '%Y-%m-%d') AS fecha_diagnostico
    FROM enfermedades e
    LEFT JOIN porcinos p ON (e.porcino_id = p.id_porcino OR e.porcino_id = p.identificacion)
    WHERE LOWER(e.estado) NOT IN ('curado', 'recuperado', 'inactivo', 'cerrado')
    ORDER BY e.fecha_diagnostico DESC, e.id DESC
  `);

  // 3. Módulo de Vacunación: Vacunas pendientes, programadas, retrasadas o aplicadas con refuerzo
  const [vacunasPendientes] = await pool.execute(`
    SELECT 
      v.id, 
      v.porcino_id, 
      COALESCE(p.identificacion, CONCAT('ID-', v.porcino_id)) AS identificacion, 
      v.nombre_vacuna, 
      v.estado, 
      v.dosis,
      DATE_FORMAT(v.fecha_aplicacion, '%Y-%m-%d') AS fecha_aplicacion,
      v.proxima_vacuna_dias
    FROM vacunacion v
    LEFT JOIN porcinos p ON (v.porcino_id = p.id_porcino OR v.porcino_id = p.identificacion)
    WHERE LOWER(v.estado) IN ('pendiente', 'retrasada', 'programada')
       OR (v.estado = 'Aplicada' AND v.proxima_vacuna_dias > 0 AND DATE_ADD(v.fecha_aplicacion, INTERVAL v.proxima_vacuna_dias DAY) <= DATE_ADD(CURRENT_DATE(), INTERVAL 15 DAY))
    ORDER BY v.fecha_aplicacion ASC, v.id DESC
  `);

  // 4. Módulo de Reproducción: Partos próximos estimados o eventos de gestación
  const [partosProximos] = await pool.execute(`
    SELECT 
      e.id, 
      e.porcino_id, 
      COALESCE(p.identificacion, CONCAT('ID-', e.porcino_id)) AS identificacion, 
      e.tipo_evento, 
      DATE_FORMAT(e.fecha_evento, '%Y-%m-%d') AS fecha_evento, 
      DATE_FORMAT(e.fecha_probable_parto, '%Y-%m-%d') AS fecha_probable_parto,
      e.observaciones
    FROM eventos_reproductivos e
    LEFT JOIN porcinos p ON (e.porcino_id = p.id_porcino OR e.porcino_id = p.identificacion)
    WHERE e.fecha_probable_parto IS NOT NULL 
      AND e.fecha_probable_parto >= DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY)
    ORDER BY e.fecha_probable_parto ASC, e.id DESC
  `);

  // 5. Módulo de Inventario: Alimentos con stock crítico o por agotarse (<= 30.00 kg o sacos)
  const [inventarioCritico] = await pool.execute(`
    SELECT 
      id, 
      tipo_alimento, 
      cantidad, 
      DATE_FORMAT(fecha_suministro, '%Y-%m-%d') AS fecha_suministro, 
      proveedor, 
      corral
    FROM alimentacion
    WHERE cantidad <= 30.00 OR cantidad IS NULL
    ORDER BY cantidad ASC, id DESC
  `);

  return {
    salud: porcinosSalud,
    enfermedades: enfermedadesActivas,
    vacunacion: vacunasPendientes,
    reproduccion: partosProximos,
    inventario: inventarioCritico
  };
}

/**
 * Obtener trazabilidad completa (Hoja de Vida) de un porcino por ID o Identificación
 */
async function getTrazabilidadPorcino(id) {
  const isNumeric = Number.isInteger(Number(id)) && String(id).trim() !== '' && !isNaN(id);
  const [porcino] = isNumeric
    ? await pool.execute("SELECT * FROM porcinos WHERE id_porcino = ? OR identificacion = ? LIMIT 1", [Number(id), String(id)])
    : await pool.execute("SELECT * FROM porcinos WHERE identificacion = ? LIMIT 1", [String(id)]);

  if (!porcino || !porcino[0]) return null;

  const targetId = porcino[0].id_porcino || porcino[0].id;
  const targetCodigo = porcino[0].identificacion;

  const [vacunas] = await pool.execute(
    "SELECT * FROM vacunacion WHERE porcino_id = ? OR porcino_id = ? ORDER BY fecha_aplicacion DESC", 
    [targetId, targetCodigo]
  );
  const [enfermedades] = await pool.execute(
    "SELECT * FROM enfermedades WHERE porcino_id = ? OR porcino_id = ? ORDER BY fecha_diagnostico DESC", 
    [targetId, targetCodigo]
  );
  const [reproduccion] = await pool.execute(
    "SELECT * FROM eventos_reproductivos WHERE porcino_id = ? OR porcino_id = ? ORDER BY fecha_evento DESC", 
    [targetId, targetCodigo]
  );

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
