const express = require('express');
const router = express.Router();
const { pool } = require('../../config/mysql');

// GET: Obtener todos los proveedores
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nombre, telefono, email, direccion 
      FROM proveedores 
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

// POST: Registrar un nuevo proveedor
router.post('/', async (req, res, next) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        status: 'fail',
        message: 'El nombre del proveedor es obligatorio'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO proveedores (nombre, telefono, email, direccion)
      VALUES (?, ?, ?, ?)
    `, [
      nombre,
      telefono || '',
      email || '',
      direccion || ''
    ]);

    const [nuevo] = await pool.execute('SELECT * FROM proveedores WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      status: 'success',
      message: '¡Proveedor registrado exitosamente!',
      data: nuevo[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
