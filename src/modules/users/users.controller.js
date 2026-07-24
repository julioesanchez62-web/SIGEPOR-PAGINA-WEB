/**
 * Controlador del módulo de usuarios.
 *
 * Contiene funciones que reciben las peticiones HTTP,
 * delegan la lógica al servicio y devuelven la respuesta al cliente.
 */
// Importa el servicio de usuarios para delegar la lógica de negocio.
const usersService = require("./users.service");

/**
 * POST /users
 *
 * Recibe los datos para crear un usuario y delega la creación al servicio.
 */
async function createUser(req, res, next) {
  // Registra la entrada al controlador para seguimiento del flujo.
  console.log("3. Entró al controller");

  try {
    // Llama al servicio con los datos ya validados por el middleware.
    const result = await usersService.create(req.body);

    // Envía una respuesta HTTP 201 con el resultado de la creación.
    return res.status(201).json(result);
  } catch (error) {
    // Pasa el error al middleware de manejo centralizado de errores.
    next(error);
  }
}

/**
 * GET /users
 *
 * Devuelve la lista completa de usuarios activos.
 */
async function getUsers(req, res, next) {
  try {
    const result = await usersService.findAll();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /users/:id
 *
 * Devuelve un único usuario por su identificador.
 */
async function getUserById(req, res, next) {
  try {
    const result = await usersService.findById(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /users/:id
 *
 * Actualiza los datos de un usuario existente.
 */
async function updateUser(req, res, next) {
  try {
    const result = await usersService.update(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /users/:id
 *
 * Realiza un borrado lógico del usuario.
 */
async function softDelete(req, res, next) {
  try {
    const result = await usersService.softDelete(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /users/:id/status
 *
 * Actualiza únicamente el estado de un usuario.
 */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await usersService.updateStatus(id, status);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// Exporta las funciones del controlador para que las rutas las utilicen.
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  softDelete,
  updateStatus,
};
