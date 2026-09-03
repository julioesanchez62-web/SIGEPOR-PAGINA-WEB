const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

async function register(data) {
  const { nombre, email, usuario, contraseña } = data;

  const existing = await authRepository.findByUserOrEmail(usuario, email);

  if (existing.length > 0) {
    const error = new Error('Ya existe un veterinario con ese usuario o correo');
    error.statusCode = 409;
    throw error;
  }

  const contraseñaHash = await bcrypt.hash(contraseña, 10);
  const result = await authRepository.createVeterinario({
    nombre,
    email,
    usuario,
    contraseñaHash
  });

  return {
    success: true,
    message: 'Veterinario registrado correctamente',
    veterinarioId: result.insertId
  };
}

async function login(data) {
  const { usuario, contraseña } = data;

  const rows = await authRepository.findByUsuario(usuario);

  if (rows.length === 0) {
    const error = new Error('Usuario o contraseña incorrectos');
    error.statusCode = 401;
    throw error;
  }

  const veterinario = rows[0];
  const isValidPassword = await bcrypt.compare(contraseña, veterinario.contraseña);

  if (!isValidPassword) {
    const error = new Error('Usuario o contraseña incorrectos');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: veterinario.id, usuario: veterinario.usuario, nombre: veterinario.nombre },
    process.env.JWT_SECRET || 'cambio_en_produccion',
    { expiresIn: '8h' }
  );

  return {
    success: true,
    token,
    veterinario: {
      id: veterinario.id,
      nombre: veterinario.nombre,
      email: veterinario.email,
      usuario: veterinario.usuario,
      fechaRegistro: veterinario.fecha_registro
    }
  };
}

async function getProfile(id) {
  const rows = await authRepository.findById(id);

  if (rows.length === 0) {
    const error = new Error('Veterinario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return {
    success: true,
    veterinario: rows[0]
  };
}

module.exports = {
  register,
  login,
  getProfile
};
