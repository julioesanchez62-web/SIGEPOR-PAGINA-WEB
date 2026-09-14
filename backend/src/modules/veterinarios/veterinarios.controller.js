/**
 * Controller del módulo de veterinarios
 *
 * RESPONSABILIDAD:
 * - Recibir la solicitud HTTP, extraer parámetros/body
 * - Invocar al servicio
 * - Responder con el código HTTP y formato adecuado
 */

const veterinariosService = require('./veterinarios.service');

/**
 * Obtener lista de todos los veterinarios
 * GET /api/veterinarios
 */
async function getVeterinarios(req, res, next) {
  try {
    const lista = await veterinariosService.getAllVeterinarios();
    const total = lista.length;
    const activos = lista.filter(v => Number(v.activo) === 1).length;
    const inactivos = total - activos;

    return res.status(200).json({
      status: 'success',
      data: lista,
      stats: {
        total,
        activos,
        inactivos
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener un veterinario por su ID
 * GET /api/veterinarios/:id
 */
async function getVeterinarioById(req, res, next) {
  try {
    const { id } = req.params;
    const veterinario = await veterinariosService.getVeterinarioById(id);

    if (!veterinario) {
      return res.status(404).json({
        status: 'error',
        message: `No se encontró ningún veterinario con el ID ${id}.`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: veterinario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crear un nuevo veterinario
 * POST /api/veterinarios
 */
async function createVeterinario(req, res, next) {
  try {
    const { id, nombre, email, usuario, contraseña, fecha_registro, activo } = req.body;

    if (!nombre || !email || !usuario || !contraseña) {
      return res.status(400).json({
        status: 'error',
        message: 'Nombre, email, usuario y contraseña son campos obligatorios.'
      });
    }

    const nuevoVet = await veterinariosService.createVeterinario({
      id,
      nombre,
      email,
      usuario,
      contraseña,
      fecha_registro,
      activo: activo !== undefined ? activo : 1
    });

    return res.status(201).json({
      status: 'success',
      message: '¡Veterinario registrado exitosamente en la base de datos!',
      data: nuevoVet
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar un veterinario por ID
 * PUT /api/veterinarios/:id
 */
async function updateVeterinario(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, email, usuario, contraseña, fecha_registro, activo } = req.body;

    if (!nombre || !email || !usuario) {
      return res.status(400).json({
        status: 'error',
        message: 'Nombre, email y usuario son requeridos para actualizar.'
      });
    }

    const vetActualizado = await veterinariosService.updateVeterinario(id, {
      nombre,
      email,
      usuario,
      contraseña,
      fecha_registro,
      activo
    });

    return res.status(200).json({
      status: 'success',
      message: '¡Veterinario actualizado exitosamente!',
      data: vetActualizado
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar un veterinario por ID
 * DELETE /api/veterinarios/:id
 */
async function deleteVeterinario(req, res, next) {
  try {
    const { id } = req.params;
    await veterinariosService.deleteVeterinario(id);

    return res.status(200).json({
      status: 'success',
      message: `Veterinario con ID ${id} eliminado correctamente de la base de datos.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVeterinarios,
  getVeterinarioById,
  createVeterinario,
  updateVeterinario,
  deleteVeterinario
};
