/**
 * Rutas del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Definir los endpoints REST (GET, POST, PUT, DELETE, etc.)
 * - Mapear cada ruta a su correspondiente controller
 * - Conectar middlewares de validación entre request y controller
 * - NO contiene lógica de negocio
 * - NO contiene SQL
 * - Solo define el "flujo de la petición"
 */

const express = require('express');
const usersController = require('./users.controller');
const userValidator = require('./users.validator');

const router = express.Router();

/**
 * POST / (POST /users)
 * Crear nuevo usuario
 * Body: { nombre, correo, contraseña, idRol }
 * Respuestas: 201, 400, 404, 409, 500
 */
router.post(
  '/',
  userValidator.validateCreateUser,
  usersController.createUser
);

/**
 * POST /login (POST /users/login)
 * 🔥 NUEVA RUTA PARA EL LOGIN DE USUARIOS
 * Body: { correo, contraseña }
 * Respuestas: 200, 400, 401, 500
 */
router.post(
  '/login',
  usersController.login
);

/**
 * GET / (GET /users)
 * Obtener lista de usuarios
 */
router.get('/', usersController.getUsers);

/**
 * GET /:id (GET /users/:id)
 * Obtener usuario por ID
 */
router.get('/:id', usersController.getUserById);

/**
 * PUT /:id (PUT /users/:id)
 * Actualizar usuario por ID
 */
router.put('/:id', usersController.updateUser);

/**
 * PATCH /:id (PATCH /users/:id)
 * Actualización parcial (Ej: cambiar estado activo)
 * 🔥 INTEGRADO Y REVISADO CON ÉXITO
 */
router.patch('/:id', usersController.patchUser);

/**
 * DELETE /:id (DELETE /users/:id)
 * Eliminar usuario por ID
 */
router.delete('/:id', usersController.deleteUser);

// Exportación única oficial del enrutador
module.exports = router;