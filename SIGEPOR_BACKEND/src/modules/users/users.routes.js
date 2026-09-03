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
 * 
 * FLUJO DE UNA PETICIÓN:
 * Cliente HTTP
 *     ↓
 * users.routes.js recibe POST /users
 *     ↓
 * Ejecuta usersValidator.validateCreateUser (middleware 1)
 *     ├─ ❌ Falla validación → Lanza error 400 → middleware error
 *     └─ ✅ OK → Continúa al siguiente middleware
 *     ↓
 * Ejecuta usersController.createUser (middleware 2)
 *     ├─ ❌ Error en negocio → Lanza error (409, 404, 500)
 *     └─ ✅ OK → Responde 201 JSON
 *     ↓
 * Cliente recibe respuesta
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
 * DELETE /:id (DELETE /users/:id)
 * Eliminar usuario por ID
 */
router.delete('/:id', usersController.deleteUser);

module.exports = router;