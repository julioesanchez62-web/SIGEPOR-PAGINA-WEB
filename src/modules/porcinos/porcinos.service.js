/**
 * Service del módulo de porcinos
 *
 * RESPONSABILIDAD:
 * - Lógica de negocio y validaciones del módulo porcino
 */

const porcinosRepository = require('./porcinos.repository');

async function getAllPorcinos() {
  return await porcinosRepository.getAllPorcinos();
}

async function getPorcinoByIdOrIdentificacion(id) {
  return await porcinosRepository.getPorcinoByIdOrIdentificacion(id);
}

async function createPorcino(datos) {
  if (!datos.identificacion || !datos.raza || !datos.peso || !datos.estado_salud || !datos.fecha_nacimiento || !datos.genero) {
    const error = new Error('Todos los campos del porcino son requeridos.');
    error.statusCode = 400;
    throw error;
  }

  // Verificar si ya existe un porcino con esa identificación
  const existente = await porcinosRepository.getPorcinoByIdOrIdentificacion(datos.identificacion);
  if (existente) {
    const error = new Error(`Ya existe un porcino registrado con la identificación '${datos.identificacion}'.`);
    error.statusCode = 409;
    throw error;
  }

  return await porcinosRepository.createPorcino(datos);
}

async function updatePorcino(id, datos) {
  const existente = await porcinosRepository.getPorcinoByIdOrIdentificacion(id);
  if (!existente) {
    const error = new Error(`El porcino con identificador '${id}' no fue encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  return await porcinosRepository.updatePorcino(existente.id, datos);
}

async function deletePorcino(id) {
  const existente = await porcinosRepository.getPorcinoByIdOrIdentificacion(id);
  if (!existente) {
    const error = new Error(`El porcino con identificador '${id}' no existe.`);
    error.statusCode = 404;
    throw error;
  }

  return await porcinosRepository.deletePorcino(existente.id);
}

async function getVeterinarios() {
  return await porcinosRepository.getVeterinarios();
}

module.exports = {
  getAllPorcinos,
  getPorcinoByIdOrIdentificacion,
  createPorcino,
  updatePorcino,
  deletePorcino,
  getVeterinarios
};
