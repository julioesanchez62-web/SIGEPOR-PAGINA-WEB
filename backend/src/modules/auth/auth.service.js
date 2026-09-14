const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const { JWT_SECRET, ROLES } = require('../../middlewares/auth.middleware');

async function login(email, contraseña) {
  const usuario = await authRepository.findUserByEmail(email);
  
  if (!usuario) {
    const error = new Error('Credenciales inválidas. Correo electrónico o contraseña incorrectos.');
    error.statusCode = 401;
    throw error;
  }

  const contrasenaBD = usuario.contraseña || usuario.contrasena || usuario.password;

  // Soporte para contraseñas encriptadas con Bcrypt y retrocompatibilidad
  let passwordMatch = false;
  if (contrasenaBD && contrasenaBD.startsWith('$2a$') || contrasenaBD.startsWith('$2b$')) {
    passwordMatch = await bcrypt.compare(contraseña, contrasenaBD);
  } else {
    passwordMatch = (contraseña === contrasenaBD);
  }
  
  if (!passwordMatch) {
    const error = new Error('Credenciales inválidas. Correo electrónico o contraseña incorrectos.');
    error.statusCode = 401;
    throw error;
  }

  // Generar Token JWT
  const tokenPayload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email || usuario.correo,
    idRol: usuario.idRol || 2,
    rolNombre: ROLES[usuario.idRol] || 'Empleado'
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

  const { contraseña: _, contrasena: __, password: ___, ...userWithoutPassword } = usuario;
  
  return {
    user: userWithoutPassword,
    token,
    rol: ROLES[usuario.idRol] || 'Empleado'
  };
}

module.exports = {
  login
};
