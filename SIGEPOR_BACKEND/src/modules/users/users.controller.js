/**
 * Controller del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Orquestar el flujo: recibir request → llamar service → responder
 * - Extraer datos de req.body y req.params
 * - Responder con códigos HTTP correctos
 */

const usersService = require('./users.service');

/**
 * Crear nuevo usuario
 * POST /users
 */
async function createUser(req, res, next) {
  try {
    const { nombre, correo, contraseña, idRol } = req.body;
    const usuario = await usersService.createUser(nombre, correo, contraseña, idRol);
    
    // Entrega confirmación exitosa dinámica al Postman
    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: usuario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener lista de usuarios
 * GET /users
 */
async function getUsers(req, res, next) {
  try {
    const usuarios = await usersService.getUsers();
    return res.status(200).json({
      message: 'Usuarios obtenidos exitosamente',
      data: usuarios
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener usuario por ID
 * GET /users/:id
 */
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await usersService.getUserById(id);
    return res.status(200).json({
      message: 'Usuario obtenido exitosamente',
      data: usuario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar usuario por ID
 * PUT /users/:id
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    
    const usuario = await usersService.updateUser(id, datosActualizados);

    return res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      data: usuario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar usuario por ID
 * DELETE /users/:id
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await usersService.deleteUser(id);
    return res.status(200).json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
