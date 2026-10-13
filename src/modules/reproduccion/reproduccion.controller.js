const service = require('./reproduccion.service');

async function getEventos(req, res, next) {
  try {
    const eventos = await service.getAllEventos();
    const cubriciones = eventos.filter(e => e.tipo_evento === 'Cubrición').length;
    const partos = eventos.filter(e => e.tipo_evento === 'Parto').length;
    const destetes = eventos.filter(e => e.tipo_evento === 'Destete').length;

    return res.status(200).json({
      status: 'success',
      data: eventos,
      stats: { total: eventos.length, cubriciones, partos, destetes }
    });
  } catch (error) {
    next(error);
  }
}

async function registrarEvento(req, res, next) {
  try {
    const nuevo = await service.createEvento(req.body);
    return res.status(201).json({
      status: 'success',
      message: '¡Evento reproductivo registrado exitosamente!',
      data: nuevo
    });
  } catch (error) {
    next(error);
  }
}

async function eliminarEvento(req, res, next) {
  try {
    const { id } = req.params;
    await service.deleteEvento(id);
    return res.status(200).json({
      status: 'success',
      message: `Evento reproductivo #${id} eliminado correctamente.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEventos,
  registrarEvento,
  eliminarEvento
};
