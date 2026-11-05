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
 * Ruta pública para autenticación e inicio de sesión de usuarios
 */
router.post('/login', usersController.login);

/**
 * POST / (POST /users)
 * Endpoint de Registro de Usuarios (Público y Administrativo)
 * 
 * 🛡️ PREVENCIÓN CONTRA ESCALADA DE PRIVILEGIOS:
 * - Solicitudes Públicas (registro_usuarios.html): El backend ignora/descarta cualquier variable
 *   de rol (`rol` o `idRol`) enviada en el body y asigna forzosamente el rol de mínimos privilegios
 *   por defecto: idRol = 4 ('Cliente').
 * - Solicitudes Administrativas (gestion_usuarios.html): Si el solicitante incluye una cabecera
 *   'Authorization: Bearer <token>' válida con rol 'Administrador' (idRol = 1), se permite asignar
 *   cualquier rol del sistema (Administrador, Empleado, Veterinario, Cliente).
 */
router.post(
  '/',
  userValidator.validateCreateUser,
  usersController.createUser
);

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * RUTAS DE ADMINISTRACIÓN INTERNA (Panel gestion_usuarios.html)
 * ══════════════════════════════════════════════════════════════════════════════
 * 🔒 PROTECCIÓN MEDIANTE MIDDLEWARES DE AUTENTICACIÓN Y CONTROL DE ACCESO (RBAC):
 * 
 * 1. verifyToken:
 *    - Intercepta la petición HTTP y extrae el token JWT del header 'Authorization: Bearer <token>'.
 *    - Verifica la firma criptográfica usando la clave secreta (JWT_SECRET) y comprueba expiración.
 *    - Si el token no existe o es inválido, rechaza inmediatamente con HTTP 401 Unauthorized.
 * 
 * 2. requireRole(['Administrador']):
 *    - Inspecciona el payload decodificado del JWT (`req.user.idRol` / `req.user.rolNombre`).
 *    - Garantiza que ÚNICAMENTE usuarios con rol 1 ('Administrador') puedan ejecutar operaciones
 *      de listado, consulta, modificación de credenciales/roles o eliminación de cuentas.
 *    - Si un usuario autenticado con otro rol (ej: Empleado, Veterinario, Cliente) intenta acceder,
 *      se bloquea de inmediato retornando HTTP 403 Forbidden.
 * ══════════════════════════════════════════════════════════════════════════════
 */

// Listar todos los usuarios del sistema (Uso exclusivo Administrador)
router.get('/', verifyToken, requireRole(['Administrador']), usersController.getUsers);

// Consultar usuario por ID (Uso exclusivo Administrador)
router.get('/:id', verifyToken, requireRole(['Administrador']), usersController.getUserById);

// Actualizar usuario completo y asignación de roles (Uso exclusivo Administrador)
router.put('/:id', verifyToken, requireRole(['Administrador']), usersController.updateUser);

// Actualización parcial de atributos (Uso exclusivo Administrador)
router.patch('/:id', verifyToken, requireRole(['Administrador']), usersController.patchUser);

// Eliminar usuario del sistema (Uso exclusivo Administrador)
router.delete('/:id', verifyToken, requireRole(['Administrador']), usersController.deleteUser);

module.exports = router;