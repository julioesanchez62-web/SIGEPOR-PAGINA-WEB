const repo = require('./reproduccion.repository');

async function getAllEventos() {
  return await repo.getAllEventos();
}

async function createEvento(datos) {
  if (!datos.porcino_id || !datos.tipo_evento || !datos.fecha_evento) {
    const error = new Error('Porcino ID, tipo de evento y fecha son campos obligatorios.');
    error.statusCode = 400;
    throw error;
  }

  // Cálculo automático de fecha probable de parto (114 días para cerdas)
  let fechaProbableParto = datos.fecha_probable_parto;
  if (datos.tipo_evento === 'Cubrición' && datos.fecha_evento && !fechaProbableParto) {
    const fecha = new Date(datos.fecha_evento);
    fecha.setDate(fecha.getDate() + 114);
    fechaProbableParto = fecha.toISOString().slice(0, 10);
  }

  return await repo.createEvento({
    ...datos,
    fecha_probable_parto: fechaProbableParto
  });
}

async function deleteEvento(id) {
  return await repo.deleteEvento(id);
}

module.exports = {
  getAllEventos,
  createEvento,
  deleteEvento
};
