const express = require('express');
const router = express.Router();
const { pool } = require('../../config/mysql');

// GET: Obtener todos los corrales
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nombre, capacidad, tipo_alimentacion, estado_limpieza, ubicacion 
      FROM corrales 
      ORDER BY id DESC
    `);
    return res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// POST: Registrar un nuevo corral
router.post('/', async (req, res, next) => {
  try {
    const { nombre, capacidad, tipo_alimentacion, estado_limpieza, ubicacion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        status: 'fail',
        message: 'El nombre del corral es obligatorio'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO corrales (nombre, capacidad, tipo_alimentacion, estado_limpieza, ubicacion)
      VALUES (?, ?, ?, ?, ?)
    `, [
      nombre,
      parseInt(capacidad, 10) || 10,
      tipo_alimentacion || 'Balanceado',
      estado_limpieza || 'Limpio',
      ubicacion || 'Nave Principal'
    ]);

    const [nuevo] = await pool.execute('SELECT * FROM corrales WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      status: 'success',
      message: '¡Corral registrado exitosamente!',
      data: nuevo[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
