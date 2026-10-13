/**
 * Controller del módulo de porcinos
 */

const porcinosService = require('./porcinos.service');

async function getPorcinos(req, res, next) {
  try {
    const lista = await porcinosService.getAllPorcinos();
    const total = lista.length;
    const saludables = lista.filter(p => p.estado_salud === 'Saludable').length;
    const observacion = lista.filter(p => p.estado_salud === 'En Observación').length;
    const enfermos = lista.filter(p => p.estado_salud === 'Enfermo').length;

    return res.status(200).json({
      status: 'success',
      data: lista,
      stats: {
        total,
        saludables,
        observacion,
        enfermos
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getPorcinoById(req, res, next) {
  try {
    const { id } = req.params;
    const porcino = await porcinosService.getPorcinoByIdOrIdentificacion(id);

    if (!porcino) {
      return res.status(404).json({
        status: 'error',
        message: `No se encontró ningún porcino con el identificador '${id}'.`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: porcino
    });
  } catch (error) {
    next(error);
  }
}

async function registrarPorcino(req, res, next) {
  try {
    const nuevoPorcino = await porcinosService.createPorcino(req.body);
    return res.status(201).json({
      status: 'success',
      message: '¡Porcino registrado exitosamente en la base de datos!',
      data: nuevoPorcino,
      porcino: nuevoPorcino
    });
  } catch (error) {
    next(error);
  }
}

async function actualizarPorcino(req, res, next) {
  try {
    const { id } = req.params;
    const porcinoActualizado = await porcinosService.updatePorcino(id, req.body);

    return res.status(200).json({
      status: 'success',
      message: '¡Datos del porcino actualizados exitosamente en MySQL!',
      data: porcinoActualizado
    });
  } catch (error) {
    next(error);
  }
}

async function eliminarPorcino(req, res, next) {
  try {
    const { id } = req.params;
    await porcinosService.deletePorcino(id);

    return res.status(200).json({
      status: 'success',
      message: `Porcino '${id}' eliminado exitosamente de la base de datos.`
    });
  } catch (error) {
    next(error);
  }
}

async function obtenerVeterinarios(req, res, next) {
  try {
    const veterinarios = await porcinosService.getVeterinarios();
    return res.status(200).json({
      status: 'success',
      data: veterinarios
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPorcinos,
  getPorcinoById,
  registrarPorcino,
  actualizarPorcino,
  eliminarPorcino,
  obtenerVeterinarios
};
