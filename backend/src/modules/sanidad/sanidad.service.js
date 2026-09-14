const repo = require('./sanidad.repository');

async function getVacunas() {
  return await repo.getAllVacunas();
}

async function createVacuna(datos) {
  if (!datos.porcino_id && !datos.pigId) {
    const error = new Error('El ID del porcino es requerido.');
    error.statusCode = 400;
    throw error;
  }
  return await repo.createVacuna({
    porcino_id: datos.porcino_id || datos.pigId,
    nombre_vacuna: datos.nombre_vacuna || datos.nombre || datos.vaccineName,
    fecha_aplicacion: datos.fecha_aplicacion || datos.fecha || datos.vaccineDate,
    estado: datos.estado || datos.vaccineStatus || 'Aplicada',
    dosis: parseFloat(datos.dosis || 2.0),
    proxima_vacuna_dias: parseInt(datos.proxima_vacuna_dias || datos.proximaVacuna || 14, 10),
    notas: datos.notas || ''
  });
}

async function deleteVacuna(id) {
  return await repo.deleteVacuna(id);
}

async function getEnfermedades() {
  return await repo.getAllEnfermedades();
}

async function createEnfermedad(datos) {
  if (!datos.porcino_id || !datos.tipo_enfermedad || !datos.tratamiento) {
    const error = new Error('Porcino ID, enfermedad y tratamiento son obligatorios.');
    error.statusCode = 400;
    throw error;
  }
  return await repo.createEnfermedad(datos);
}

async function deleteEnfermedad(id) {
  return await repo.deleteEnfermedad(id);
}

module.exports = {
  getVacunas,
  createVacuna,
  deleteVacuna,
  getEnfermedades,
  createEnfermedad,
  deleteEnfermedad
};
