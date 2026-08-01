const { query } = require('../config/database');

async function findByUserOrEmail(usuario, email) {
  return query(
    'SELECT id, nombre, email, usuario, contraseña FROM veterinarios WHERE usuario = ? OR email = ?',
    [usuario, email]
  );
}

async function findByUsuario(usuario) {
  return query(
    'SELECT id, nombre, email, usuario, contraseña, fecha_registro FROM veterinarios WHERE usuario = ?',
    [usuario]
  );
}

async function createVeterinario({ nombre, email, usuario, contraseñaHash }) {
  return query(
    'INSERT INTO veterinarios (nombre, email, usuario, contraseña, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
    [nombre, email, usuario, contraseñaHash]
  );
}

async function findById(id) {
  return query(
    'SELECT id, nombre, email, usuario, fecha_registro FROM veterinarios WHERE id = ?',
    [id]
  );
}

module.exports = {
  findByUserOrEmail,
  findByUsuario,
  createVeterinario,
  findById
};
