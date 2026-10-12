/**
 * Service del módulo de veterinarios
 *
 * RESPONSABILIDAD:
 * - Lógica de negocio para veterinarios
 * - Coordinar llamadas al repositorio
 * - Validaciones de existencia y duplicados
 */

const bcrypt = require('bcryptjs');
const veterinariosRepository = require('./veterinarios.repository');

/**
 * Obtener todos los veterinarios
 */
async function getAllVeterinarios() {
  return await veterinariosRepository.getAllVeterinarios();
}

/**
 * Obtener un veterinario por ID
 */
async function getVeterinarioById(id) {
  return await veterinariosRepository.getVeterinarioById(id);
}

/**
 * Crear un nuevo veterinario
 */
async function createVeterinario(datos) {
  // Validar si el ID ya existe en caso de que se pase un ID manual
  if (datos.id && Number(datos.id) > 0) {
    const existeId = await veterinariosRepository.getVeterinarioById(datos.id);
    if (existeId) {
      const error = new Error(`Ya existe un veterinario registrado con el ID #${datos.id}. Si desea crear uno nuevo, deje el campo ID vacío.`);
      error.statusCode = 409;
      throw error;
    }
  }

  // Validar si el correo o usuario ya existen
  if (datos.email || datos.usuario) {
    const existe = await veterinariosRepository.findByEmailOrUsername(datos.email, datos.usuario);
    if (existe) {
      const error = new Error('Ya existe un veterinario registrado con ese correo o nombre de usuario.');
      error.statusCode = 409;
      throw error;
    }
  }

  // Encriptar la contraseña si se proporciona
  if (datos.contraseña && !datos.contraseña.startsWith('$2a$') && !datos.contraseña.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    datos.contraseña = await bcrypt.hash(datos.contraseña, salt);
  }

  return await veterinariosRepository.createVeterinario(datos);
}

/**
 * Actualizar datos de un veterinario
 */
async function updateVeterinario(id, datos) {
  const existente = await veterinariosRepository.getVeterinarioById(id);
  if (!existente) {
    const error = new Error(`El veterinario con ID ${id} no fue encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  // Encriptar contraseña si viene modificada
  if (datos.contraseña && !datos.contraseña.startsWith('$2a$') && !datos.contraseña.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    datos.contraseña = await bcrypt.hash(datos.contraseña, salt);
  }

  return await veterinariosRepository.updateVeterinario(id, datos);
}

/**
 * Eliminar un veterinario
 */
async function deleteVeterinario(id) {
  const existente = await veterinariosRepository.getVeterinarioById(id);
  if (!existente) {
    const error = new Error(`El veterinario con ID ${id} no existe.`);
    error.statusCode = 404;
    throw error;
  }

  return await veterinariosRepository.deleteVeterinario(id);
}

module.exports = {
  getAllVeterinarios,
  getVeterinarioById,
  createVeterinario,
  updateVeterinario,
  deleteVeterinario
};
