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
        l.id_usuario,
        COALESCE(v.nombre, u.nombre, 'Administrador / Personal') AS veterinario_nombre,
        l.accion, 
        l.descripcion, 
        DATE_FORMAT(l.fecha_hora, '%Y-%m-%d %H:%i:%s') AS fecha_hora 
      FROM logs_actividad l
      LEFT JOIN veterinarios v ON l.veterinario_id = v.id_veterinario
      LEFT JOIN usuarios u ON (l.id_usuario = u.id_usuario OR l.veterinario_id = u.id_usuario)
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
    const { veterinario_id, id_veterinario, id_usuario, accion, descripcion } = req.body;
    const vetId = id_veterinario || veterinario_id;

    if (!accion) {
      return res.status(400).json({
        status: 'fail',
        message: 'La acción del log es obligatoria'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO logs_actividad (veterinario_id, id_usuario, accion, descripcion, fecha_hora)
      VALUES (?, ?, ?, ?, NOW())
    `, [
      vetId ? parseInt(vetId, 10) : null,
      id_usuario ? parseInt(id_usuario, 10) : null,
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
