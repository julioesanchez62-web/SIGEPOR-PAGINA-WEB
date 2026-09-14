const service = require('./inventario.service');

async function getAlimentos(req, res, next) {
  try {
    const lista = await service.getAlimentos();
    const totalKilos = lista.reduce((acc, curr) => acc + parseFloat(curr.cantidad || 0), 0);
    return res.status(200).json({
      status: 'success',
      data: lista,
      stats: { totalRegistros: lista.length, totalKilos }
    });
  } catch (error) {
    next(error);
  }
}

async function registrarAlimento(req, res, next) {
  try {
    const nuevo = await service.createAlimento(req.body);
    return res.status(201).json({
      status: 'success',
      message: '¡Alimento registrado en inventario exitosamente!',
      data: nuevo
    });
  } catch (error) {
    next(error);
  }
}

async function eliminarAlimento(req, res, next) {
  try {
    const { id } = req.params;
    await service.deleteAlimento(id);
    return res.status(200).json({ status: 'success', message: `Registro de alimento #${id} eliminado.` });
  } catch (error) {
    next(error);
  }
}

async function getCorrales(req, res, next) {
  try {
    const corrales = await service.getCorrales();
    return res.status(200).json({ status: 'success', data: corrales });
  } catch (error) {
    next(error);
  }
}

async function registrarCorral(req, res, next) {
  try {
    const nuevo = await service.createCorral(req.body);
    return res.status(201).json({ status: 'success', message: '¡Corral registrado!', data: nuevo });
  } catch (error) {
    next(error);
  }
}

async function getProveedores(req, res, next) {
  try {
    const proveedores = await service.getProveedores();
    return res.status(200).json({ status: 'success', data: proveedores });
  } catch (error) {
    next(error);
  }
}

async function registrarProveedor(req, res, next) {
  try {
    const nuevo = await service.createProveedor(req.body);
    return res.status(201).json({ status: 'success', message: '¡Proveedor registrado!', data: nuevo });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlimentos,
  registrarAlimento,
  eliminarAlimento,
  getCorrales,
  registrarCorral,
  getProveedores,
  registrarProveedor
};
