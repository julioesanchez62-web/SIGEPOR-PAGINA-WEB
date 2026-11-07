const express = require('express');
const router = express.Router();
const { pool } = require('../../config/mysql');

// GET: Obtener todas las enfermedades diagnosticadas
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        e.id, 
        e.porcino_id, 
        COALESCE(p.identificacion, CONCAT('ID #', e.porcino_id)) AS porcino_identificacion,
        e.tipo_enfermedad, 
        DATE_FORMAT(e.fecha_diagnostico, '%Y-%m-%d') AS fecha_diagnostico, 
        e.tratamiento, 
        e.estado 
      FROM enfermedades e
      LEFT JOIN porcinos p ON e.porcino_id = p.id
      ORDER BY e.id DESC
    `);
    return res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// POST: Registrar un nuevo diagnóstico de enfermedad
router.post('/', async (req, res, next) => {
  try {
    const { porcino_id, tipo_enfermedad, fecha_diagnostico, tratamiento, estado } = req.body;

    if (!porcino_id || !tipo_enfermedad || !fecha_diagnostico || !tratamiento) {
      return res.status(400).json({
        status: 'fail',
        message: 'Todos los campos obligatorios deben ser diligenciados'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO enfermedades (porcino_id, tipo_enfermedad, fecha_diagnostico, tratamiento, estado)
      VALUES (?, ?, ?, ?, ?)
    `, [
      parseInt(porcino_id, 10),
      tipo_enfermedad,
      fecha_diagnostico,
      tratamiento,
      estado || 'En Tratamiento'
    ]);

    const [nuevo] = await pool.execute('SELECT * FROM enfermedades WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      status: 'success',
      message: '¡Diagnóstico médico de enfermedad registrado exitosamente!',
      data: nuevo[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
