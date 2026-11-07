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

  // VALIDACIÓN ESTRICTA: Validar si el usuario está activo antes de emitir token JWT
  if (usuario.activo !== undefined && (Number(usuario.activo) === 0 || usuario.activo === false)) {
    const error = new Error('Acceso denegado: El usuario se encuentra inactivo en el sistema. Contacte al administrador.');
    error.statusCode = 403;
    throw error;
  }

  const contrasenaBD = usuario.contraseña || usuario.contrasena || usuario.password;

  // Verificación con Bcrypt y Auto-Migración de contraseñas en texto plano
  let passwordMatch = false;
  if (contrasenaBD && (contrasenaBD.startsWith('$2a$') || contrasenaBD.startsWith('$2b$'))) {
    passwordMatch = await bcrypt.compare(contraseña, contrasenaBD);
  } else if (contrasenaBD && contrasenaBD === contraseña) {
    // Si la contraseña en la BD estaba en texto plano, permitir acceso y cifrarla inmediatamente
    passwordMatch = true;
    try {
      const hashed = await bcrypt.hash(contraseña, 10);
      await authRepository.updatePassword(usuario.id_usuario || usuario.id, hashed);
    } catch (e) {
      console.warn('⚠️ No se pudo auto-encriptar contraseña heredada:', e.message);
    }
  } else {
    passwordMatch = false;
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
