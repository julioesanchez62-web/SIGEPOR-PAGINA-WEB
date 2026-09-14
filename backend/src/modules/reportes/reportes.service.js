const repo = require('./reportes.repository');
const porcinosRepo = require('../porcinos/porcinos.repository');
const usersRepo = require('../users/users.repository');
const sanidadRepo = require('../sanidad/sanidad.repository');
const inventarioRepo = require('../inventario/inventario.repository');

async function getAlertas() {
  return await repo.getAlertasSistema();
}

async function getTrazabilidad(id) {
  const result = await repo.getTrazabilidadPorcino(id);
  if (!result) {
    const error = new Error(`No se encontró el porcino con identificador '${id}'.`);
    error.statusCode = 404;
    throw error;
  }
  return result;
}

async function exportarDatos(tipo) {
  let datos = [];
  if (tipo === 'porcinos') {
    datos = await porcinosRepo.getAllPorcinos();
  } else if (tipo === 'usuarios') {
    datos = await usersRepo.getAllUsers();
  } else if (tipo === 'vacunas') {
    datos = await sanidadRepo.getAllVacunas();
  } else if (tipo === 'inventario') {
    datos = await inventarioRepo.getAlimentos();
  } else {
    datos = await porcinosRepo.getAllPorcinos();
  }
  return datos;
}

module.exports = {
  getAlertas,
  getTrazabilidad,
  exportarDatos
};
