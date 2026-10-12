const service = require('./sanidad.service');

async function getVacunas(req, res, next) {
  try {
    const vacunas = await service.getVacunas();
    const aplicadas = vacunas.filter(v => v.estado === 'Aplicada').length;
    const pendientes = vacunas.filter(v => v.estado === 'Pendiente' || v.estado === 'Retrasada').length;

    return res.status(200).json({
      status: 'success',
      data: vacunas,
      stats: { total: vacunas.length, aplicadas, pendientes }
    });
  } catch (error) {
    next(error);
  }
}

async function registrarVacuna(req, res, next) {
  try {
    const nueva = await service.createVacuna(req.body);
    return res.status(201).json({
      status: 'success',
      message: '¡Vacunación registrada exitosamente!',
      data: nueva
    });
  } catch (error) {
    next(error);
  }
}

async function eliminarVacuna(req, res, next) {
  try {
    const { id } = req.params;
    await service.deleteVacuna(id);
    return res.status(200).json({
      status: 'success',
      message: `Vacunación #${id} eliminada correctamente.`
    });
  } catch (error) {
    next(error);
  }
}

async function getEnfermedades(req, res, next) {
  try {
    const lista = await service.getEnfermedades();
    return res.status(200).json({ status: 'success', data: lista });
  } catch (error) {
    next(error);
  }
}

async function registrarEnfermedad(req, res, next) {
  try {
    const nueva = await service.createEnfermedad(req.body);
    return res.status(201).json({
      status: 'success',
      message: '¡Diagnóstico sanitario registrado exitosamente!',
      data: nueva
    });
  } catch (error) {
    next(error);
  }
}

async function eliminarEnfermedad(req, res, next) {
  try {
    const { id } = req.params;
    await service.deleteEnfermedad(id);
    return res.status(200).json({
      status: 'success',
      message: `Registro de enfermedad #${id} eliminado.`
    });
  } catch (error) {
    next(error);
  }
}

async function getEstadisticasResumen(req, res, next) {
  try {
    const vacunas = await service.getVacunas();
    const aplicadas = vacunas.filter(v => v.estado === 'Aplicada').length;
    const pendientes = vacunas.filter(v => v.estado === 'Pendiente').length;
    const retrasadas = vacunas.filter(v => v.estado === 'Retrasada').length;

    return res.status(200).json({
      status: 'success',
      total: vacunas.length,
      aplicadas,
      pendientes,
      retrasadas
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVacunas,
  getEstadisticasResumen,
  registrarVacuna,
  eliminarVacuna,
  getEnfermedades,
  registrarEnfermedad,
  eliminarEnfermedad
};
