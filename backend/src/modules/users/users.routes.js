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
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /login (POST /users/login)
 * Ruta pública para el login de usuarios
 */
router.post('/login', usersController.login);

/**
 * POST / (POST /users)
 * Crear nuevo usuario (Registro público o administrativo)
 */
router.post(
  '/',
  userValidator.validateCreateUser,
  usersController.createUser
);

/**
 * Rutas de administración de usuarios protegidas con JWT y RBAC (Solo Administrador)
 */
router.get('/', verifyToken, requireRole(['Administrador']), usersController.getUsers);
router.get('/:id', verifyToken, requireRole(['Administrador']), usersController.getUserById);
router.put('/:id', verifyToken, requireRole(['Administrador']), usersController.updateUser);
router.patch('/:id', verifyToken, requireRole(['Administrador']), usersController.patchUser);
router.delete('/:id', verifyToken, requireRole(['Administrador']), usersController.deleteUser);

module.exports = router;