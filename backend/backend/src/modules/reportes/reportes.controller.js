const service = require('./reportes.service');

async function getAlertas(req, res, next) {
  try {
    const alertas = await service.getAlertas();
    return res.status(200).json({ status: 'success', data: alertas });
  } catch (error) {
    next(error);
  }
}

async function getTrazabilidad(req, res, next) {
  try {
    const { id } = req.params;
    const historial = await service.getTrazabilidad(id);
    return res.status(200).json({ status: 'success', data: historial });
  } catch (error) {
    next(error);
  }
}

async function exportarDatos(req, res, next) {
  try {
    const { tipo } = req.params;
    const datos = await service.exportarDatos(tipo);
    return res.status(200).json({
      status: 'success',
      tipo,
      total: datos.length,
      data: datos
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlertas,
  getTrazabilidad,
  exportarDatos
};
