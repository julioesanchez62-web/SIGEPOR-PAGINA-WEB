const repo = require('./inventario.repository');

async function getAlimentos() {
  return await repo.getAlimentos();
}

async function createAlimento(datos) {
  if (!datos.tipo_alimento || !datos.cantidad || !datos.fecha_suministro) {
    const error = new Error('Tipo de alimento, cantidad y fecha son obligatorios.');
    error.statusCode = 400;
    throw error;
  }
  return await repo.createAlimento(datos);
}

async function deleteAlimento(id) {
  return await repo.deleteAlimento(id);
}

async function getCorrales() {
  return await repo.getCorrales();
}

async function createCorral(datos) {
  if (!datos.nombre) {
    const error = new Error('El nombre o código del corral es obligatorio.');
    error.statusCode = 400;
    throw error;
  }
  return await repo.createCorral(datos);
}

async function getProveedores() {
  return await repo.getProveedores();
}

async function createProveedor(datos) {
  if (!datos.nombre) {
    const error = new Error('El nombre del proveedor es obligatorio.');
    error.statusCode = 400;
    throw error;
  }
  return await repo.createProveedor(datos);
}

module.exports = {
  getAlimentos,
  createAlimento,
  deleteAlimento,
  getCorrales,
  createCorral,
  getProveedores,
  createProveedor
};
