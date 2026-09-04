/**
 * Servicio del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Aplicar reglas de negocio
 * - Coordinar llamadas al repositorio
 * - NO ejecuta consultas SQL directamente
 */

const bcrypt = require('bcryptjs'); 
const usersRepository = require('./users.repository');

/**
 * Crear un nuevo usuario e introducirlo en MySQL Workbench
 * Encripta la contraseña usando bcryptjs antes de enviarla al repositorio
 */
async function createUser(nombre, correo, contraseña, idRol) {
  try {
    // 1. Validar si el correo electrónico ya está registrado en la Base de Datos
    const usuarioExistente = await usersRepository.findUserByEmail(correo);
    if (usuarioExistente) {
      const error = new Error('El correo electrónico ya se encuentra registrado.');
      error.statusCode = 409; // Conflict
      throw error;
    }

    // 2. Generar la encriptación segura de la contraseña (el Hash $2a$10$...)
    const sal = await bcrypt.genSalt(10);
    const contraseñaHash = await bcrypt.hash(contraseña, sal);

    // 3. Preparar los datos limpios para el objeto que va hacia el repositorio
    const nuevoUsuarioData = {
      nombre,
      correo,
      contraseñaHash,
      idRol: idRol || 1 // Rol 1 por defecto si no se especifica
    };

    // 4. Delegar la inserción SQL al repositorio asíncrono
    const usuarioCreado = await usersRepository.createUser(nuevoUsuarioData);
    return usuarioCreado;

  } catch (error) {
    throw error;
  }
}

/**
 * Autenticar un usuario verificando su correo y contraseña
 * Compara la contraseña plana ingresada contra el hash seguro de tu Base de Datos
 */
async function loginUser(correo, contraseña) {
  // 1. Buscamos el usuario usando la función exacta de tu repositorio
  const usuario = await usersRepository.findUserByEmail(correo);

  // 2. Si el repositorio devuelve null, significa que el correo no existe
  if (!usuario) {
    return null;
  }

  // 3. Extraemos el hash seguro de la base de datos mapeado por tu repositorio
  const hashBD = usuario.contraseña || usuario.contrasena;

  // 4. Comparamos la contraseña plana del formulario contra el hash de Workbench
  const esClaveValida = await bcrypt.compare(contraseña, hashBD);

  if (!esClaveValida) {
    return null; // La contraseña encriptada no coincide con el texto plano
  }

  // 5. Si las credenciales son correctas, retornamos el usuario validado
  return usuario;
}

/**
 * Obtener todos los usuarios de la base de datos
 */
async function getUsers() {
  return await usersRepository.getUsers();
}

/**
 * Obtener un usuario específico filtrado por su ID
 */
async function getUserById(id) {
  const usuario = await usersRepository.findUserById(id);
  if (!usuario) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return usuario;
}

/**
 * Actualizar los datos de un usuario por su ID
 */
async function updateUser(id, datos) {
  return await usersRepository.updateUser(id, datos);
}

/**
 * Eliminar un usuario de la base de datos por su ID
 */
async function deleteUser(id) {
  return await usersRepository.deleteUser(id);
}

// 🔥 EXPORTACIÓN COMPLETA Y SIN ERRORES DE TODAS LAS FUNCIONES DEL MÓDULO
module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
