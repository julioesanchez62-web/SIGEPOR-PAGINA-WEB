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

const usersRepository = require('./users.repository');

/**
 * 🟢 Lógica para: GUARDAR CAMBIOS
 * Crear un nuevo usuario en el sistema
 */
async function createUser(nombre, correo, contraseña, idRol) {
  // Aquí podrías agregar lógica de negocio en el futuro, como encriptar contraseñas
  return await usersRepository.createUser({ nombre, correo, contraseña, idRol });
}

/**
 * Lógica para iniciar sesión
 * 🔥 FUNCIÓN INTEGRADA CON ÉXITO
 */
async function loginUser(identificador, contraseña) {
  // Busca el usuario utilizando el repositorio correspondiente
  const usuario = await usersRepository.findByEmailOrUsername(identificador);
  
  if (!usuario) return null;

  // Validación temporal de contraseña en texto plano (luego puedes migrar a bcrypt)
  if (usuario.contraseña !== contraseña) return null;

  return usuario;
}

/**
 * Obtener todos los usuarios del sistema
 */
async function getAllUsers() {
  return await usersRepository.getAllUsers();
}

/**
 * 🔵 Lógica para: CONSULTAR USUARIO
 * Buscar un usuario específico mediante su ID único
 */
async function getUserById(id) {
  return await usersRepository.getUserById(id);
}

/**
 * 🔵 Lógica para: ACTUALIZAR USUARIO
 * Modificar los datos completos de un usuario existente
 */
async function updateUser(id, datosActualizados) {
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
