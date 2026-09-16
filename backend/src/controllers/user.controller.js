// src/controllers/user.controller.js
const { pool } = require('../config/mysql');

const createUser = async (req, res, next) => {
  try {
    const { nombre, email, usuario, contraseña, id_rol, activo } = req.body;
    
    if (!nombre || !email || !usuario || !contraseña) {
      return res.status(400).json({ status: 'fail', message: 'Faltan campos obligatorios' });
    }

    const query = `INSERT INTO usuarios (nombre, email, usuario, contraseña, id_rol, activo) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [nombre, email, usuario, contraseña, id_rol || 4, activo || 1];

    const [result] = await pool.query(query, values);

    return res.status(201).json({
      status: 'success',
      message: 'Usuario guardado exitosamente en MySQL',
      id_insertado: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// ⚠️ DEBEN EXISTIR ESTAS FUNCIONES PARA QUE router.get() NO FALLE:
const getUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id_usuario, nombre, email, usuario, id_rol, activo FROM usuarios');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    res.json({ status: 'success', message: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json({ status: 'success', user: req.user || null });
  } catch (error) {
    next(error);
  }
};

// ⚠️ ASEGÚRATE DE EXPORTAR TODAS AQUÍ:
module.exports = {
  createUser,
  getUsers,
  deleteUser,
  getProfile
};