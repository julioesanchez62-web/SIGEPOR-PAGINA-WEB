/**
 * Servicio del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Contener la lógica de negocio del módulo de usuarios
 * - Coordinar llamadas al repositorio (users.repository)
 * - Realizar validaciones lógicas complejas (ej: verificar si un correo ya existe)
 * - NO maneja directamente req ni res de HTTP
 * - NO ejecuta SQL directamente
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersRepository = require('./users.repository');
const { JWT_SECRET, ROLES } = require('../../middlewares/auth.middleware');

/**
 * 🟢 Lógica para: GUARDAR CAMBIOS
 * Crear un nuevo usuario en el sistema con contraseña encriptada (Bcrypt)
 */
async function createUser(nombre, correo, contraseña, idRol) {
  // Encriptamos la contraseña antes de guardar en MySQL
  const salt = await bcrypt.genSalt(10);
  const hashContrasena = await bcrypt.hash(contraseña, salt);

  return await usersRepository.createUser({
    nombre,
    correo,
    contraseña: hashContrasena,
    idRol: idRol || 2
  });
}

/**
 * Lógica para iniciar sesión con Bcrypt y generación de Token JWT
 */
async function loginUser(identificador, contraseña) {
  const usuario = await usersRepository.findByEmailOrUsername(identificador);
  if (!usuario) return null;

  const contrasenaBD = usuario.contraseña || usuario.password;

  let passwordMatch = false;
  if (contrasenaBD && (contrasenaBD.startsWith('$2a$') || contrasenaBD.startsWith('$2b$'))) {
    passwordMatch = await bcrypt.compare(contraseña, contrasenaBD);
  } else {
    passwordMatch = (contraseña === contrasenaBD);
  }

  if (!passwordMatch) return null;

  // Generación de Token JWT para control de sesión y RBAC
  const tokenPayload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.correo || usuario.email,
    idRol: usuario.idRol || 2,
    rolNombre: ROLES[usuario.idRol] || 'Empleado'
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

  const { contraseña: _, password: __, ...userClean } = usuario;

  return {
    ...userClean,
    token,
    rolNombre: ROLES[usuario.idRol] || 'Empleado'
  };
}

/**
 * Obtener todos los usuarios del sistema
 */
async function getAllUsers() {
  return await usersRepository.getAllUsers();
}

/**
 * 🔵 Lógica para: CONSULTAR USUARIO
 */
async function getUserById(id) {
  return await usersRepository.getUserById(id);
}

/**
 * 🔵 Lógica para: ACTUALIZAR USUARIO
 */
async function updateUser(id, datosActualizados) {
  if (datosActualizados.contraseña && !datosActualizados.contraseña.startsWith('$2a$')) {
    const salt = await bcrypt.genSalt(10);
    datosActualizados.contraseña = await bcrypt.hash(datosActualizados.contraseña, salt);
  }
  return await usersRepository.updateUser(id, datosActualizados);
}

/**
 * Aplicar cambios parciales a un usuario
 */
async function patchUser(id, camposCambiados) {
  return await usersRepository.patchUser(id, camposCambiados);
}

/**
 * 🔴 Lógica para: BORRAR USUARIO
 * Eliminar de forma definitiva a un usuario del sistema
 */
async function deleteUser(id) {
  return await usersRepository.deleteUser(id);
}

// Exportación única de todas las funciones del servicio
module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser
};
