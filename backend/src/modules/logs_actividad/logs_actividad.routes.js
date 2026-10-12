const express = require('express');
const router = express.Router();
const { pool } = require('../../config/mysql');

// GET: Obtener todos los logs de actividad
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.id, 
        l.veterinario_id, 
        COALESCE(v.nombre, 'Administrador / Sistema') AS veterinario_nombre,
        l.accion, 
        l.descripcion, 
        DATE_FORMAT(l.fecha_hora, '%Y-%m-%d %H:%i:%s') AS fecha_hora 
      FROM logs_actividad l
      LEFT JOIN veterinarios v ON l.veterinario_id = v.id
      ORDER BY l.id DESC
    `);
    return res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// POST: Registrar un nuevo log de actividad
router.post('/', async (req, res, next) => {
  try {
    const { veterinario_id, accion, descripcion } = req.body;

    if (!accion) {
      return res.status(400).json({
        status: 'fail',
        message: 'La acción del log es obligatoria'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO logs_actividad (veterinario_id, accion, descripcion, fecha_hora)
      VALUES (?, ?, ?, NOW())
    `, [
      veterinario_id ? parseInt(veterinario_id, 10) : null,
      accion,
      descripcion || ''
    ]);

    const [nuevo] = await pool.execute('SELECT * FROM logs_actividad WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      status: 'success',
      message: '¡Log de actividad registrado exitosamente!',
      data: nuevo[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
