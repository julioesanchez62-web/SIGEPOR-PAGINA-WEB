/**
 * Service del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Aplicar la lógica de negocio (reglas del sistema)
 * - Orquestar llamadas al repository (en el orden correcto)
 * - Cifrar contraseñas con bcryptjs
 * - Validar reglas complejas (ej: ¿existe ese correo?, ¿existe ese rol?)
 * - Lanzar errores con statusCode apropiado
 */

const bcryptjs = require('bcryptjs');
const usersRepository = require('./users.repository');

/**
 * Helper interno para parsear y validar ID numérico
 */
function parseUserId(id) {
  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) {
    const error = new Error('ID de usuario inválido');
    error.statusCode = 400;
    throw error;
  }
  return idNum;
}

/**
 * Crear nuevo usuario
 */
async function createUser(nombre, correo, contraseña, idRol) {
  // REGLA 1: Verificar que el correo NO exista previamente
  const usuarioExistente = await usersRepository.findUserByEmail(correo);
  if (usuarioExistente) {
    const error = new Error('El correo ya está registrado');
    error.statusCode = 409;
    throw error; // Detiene el flujo e interrumpe la creación enviando al Catch
  }

  // REGLA 2: Verificar que el rol EXISTA
  const rolExiste = await usersRepository.findRoleById(idRol);
  if (!rolExiste) {
    const error = new Error('El rol especificado no existe');
    error.statusCode = 404;
    throw error;
  }

  // REGLA 3: Cifrar la contraseña
  const contraseñaHash = await bcryptjs.hash(contraseña, 10);

  // REGLA 4: Guardar en BD con contraseña cifrada
  const usuarioCreado = await usersRepository.createUser({
    nombre,
    correo,
    contraseñaHash,
    idRol
  });

  // REGLA 5: Retornar usuario SIN datos sensibles
  if (usuarioCreado) {
    delete usuarioCreado.contraseña;
    delete usuarioCreado.contraseñaHash;
  }

  return usuarioCreado;
}

/**
 * Obtener todos los usuarios
 */
async function getUsers() {
  return await usersRepository.getUsers();
}

/**
 * Obtener usuario por ID
 */
async function getUserById(id) {
  const idNum = parseUserId(id);

  const usuario = await usersRepository.findUserById(idNum);
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return usuario;
}

/**
 * Actualizar usuario por ID
 */
async function updateUser(id, datos) {
  const idNum = parseUserId(id);
  
  // 1. Obtener usuario actual para conocer su email en BD
  const usuarioExistente = await getUserById(idNum);

  const nuevoCorreo = datos.correo || datos.email;
  const correoActual = usuarioExistente.correo || usuarioExistente.email;

  // 2. Si el correo cambió, verificar que NO le pertenezca a OTRO ID
  if (nuevoCorreo && nuevoCorreo !== correoActual) {
    const usuarioConMismoCorreo = await usersRepository.findUserByEmail(nuevoCorreo);
    
    // Solo es conflicto si existe Y tiene un ID distinto
    if (usuarioConMismoCorreo && usuarioConMismoCorreo.id !== idNum) {
      const error = new Error('El correo ya está registrado por otro usuario');
      error.statusCode = 409;
      throw error;
    }
  }

  // 3. Cifrar contraseña si viene en los datos
  if (datos.contraseña) {
    datos.contraseñaHash = await bcryptjs.hash(datos.contraseña, 10);
    delete datos.contraseña;
  }

  // 4. Actualizar en el repositorio
  const usuarioActualizado = await usersRepository.updateUser(idNum, datos);

  // 5. Ocultar información sensible
  if (usuarioActualizado) {
    delete usuarioActualizado.contraseña;
    delete usuarioActualizado.contraseñaHash;
  }

  return usuarioActualizado;
}

/**
 * Eliminar usuario por ID
 */
async function deleteUser(id) {
  const idNum = parseUserId(id);
  await getUserById(idNum); // Valida existencia (lanza 404 si no existe)
  return await usersRepository.deleteUser(idNum);
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};