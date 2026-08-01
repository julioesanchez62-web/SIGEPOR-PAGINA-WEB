const porcinosRepository = require('../repositories/porcinos.repository');

async function getPorcinos() {
  const porcinos = await porcinosRepository.getAllPorcinos();
  return {
    success: true,
    count: porcinos.length,
    porcinos
  };
}

async function createPorcino(data) {
  const payload = data || {};
  const identificacion = (payload.identificacion || '').toString().trim();
  const raza = (payload.raza || 'No especificada').toString().trim();
  const peso = payload.peso || 0;
  const estadoSalud = (payload.estadoSalud || 'Sin registrar').toString().trim();

  if (!identificacion) {
    const error = new Error('La identificación del porcino es obligatoria');
    error.statusCode = 400;
    throw error;
  }

  const created = await porcinosRepository.createPorcino({ identificacion, raza, peso, estadoSalud });

  return {
    success: true,
    message: 'Porcino creado correctamente',
    porcinoId: created.insertId
  };
}

module.exports = {
  getPorcinos,
  createPorcino
};
