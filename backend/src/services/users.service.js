const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/users.repository');

async function createUser(data) {
  const payload = data || {};
  const nombre = (payload.nombre || payload.name || '').toString().trim();
  const email = (payload.email || '').toString().trim();
  const usuario = (payload.usuario || payload.username || '').toString().trim();
  const contraseña = payload.contraseña || payload.password || '';

  if (!nombre || !email || !usuario || !contraseña) {
    const error = new Error('Nombre, email, usuario y contraseña son obligatorios');
    error.statusCode = 400;
    throw error;
  }

  if (contraseña.toString().length < 6) {
    const error = new Error('La contraseña debe tener al menos 6 caracteres');
    error.statusCode = 400;
    throw error;
  }

  const existing = await userRepository.findByUserOrEmail(usuario, email);
  if (existing.length > 0) {
    const error = new Error('El usuario o correo ya existe');
    error.statusCode = 409;
    throw error;
  }

  const contraseñaHash = await bcrypt.hash(contraseña, 10);
  const created = await userRepository.createUser({ nombre, email, usuario, contraseñaHash });

  return {
    success: true,
    message: 'Usuario creado correctamente',
    userId: created.insertId
  };
}

async function getUsers() {
  const users = await userRepository.getAllUsers();
  return {
    success: true,
    count: users.length,
    users
  };
}

module.exports = {
  createUser,
  getUsers
};
