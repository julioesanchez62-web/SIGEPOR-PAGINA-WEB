const express = require("express");

// Controlador que contiene la lógica de negocio para usuarios.
const usersController = require("./users.controller");

// Validadores para las solicitudes relacionadas con usuarios.
const {
  validateCreateUser,
  validateUserId,
  validateUpdateUser,
  validateStatus,
} = require("./users.validator");

// Middleware de autenticación y autorización.
const {
  authenticateToken,
  authorizeRoles,
} = require("../../middlewares/auth.middleware");

const router = express.Router();

// Definición de los roles disponibles en el sistema.
const ROLE_IDS = {
  SYSTEM_ADMIN: 1,
  HR_ANALYST: 2,
  APPLICANT: 3,
  HR_DIRECTOR: 4,
};

// Todas las rutas de usuarios requieren un token JWT válido.
router.use(authenticateToken);

/**
 * POST /users
 *
 * Crea un nuevo usuario. Solo el Administrador del sistema
 * puede acceder a esta ruta.
 */
router.post(
  "/",
  authorizeRoles(ROLE_IDS.SYSTEM_ADMIN),
  validateCreateUser,
  usersController.createUser,
);

/**
 * GET /users/me
 *
 * Devuelve los datos del usuario autenticado según el token.
 */
router.get("/me", usersController.getAuthenticatedUser);

/**
 * GET /users
 *
 * Recupera la lista de usuarios que no han sido eliminados.
 * Los roles permitidos son Administrador del sistema, Analista de
 * Recursos Humanos y Director de Recursos Humanos.
 */
router.get(
  "/",
  authorizeRoles(
    ROLE_IDS.SYSTEM_ADMIN,
    ROLE_IDS.HR_ANALYST,
    ROLE_IDS.HR_DIRECTOR,
  ),
  usersController.getUsers,
);

/**
 * GET /users/:id
 *
 * Valida el ID de usuario y devuelve los datos de ese usuario.
 */
router.get(
  "/:id",
  authorizeRoles(
    ROLE_IDS.SYSTEM_ADMIN,
    ROLE_IDS.HR_ANALYST,
    ROLE_IDS.HR_DIRECTOR,
  ),
  validateUserId,
  usersController.getUserById,
);

/**
 * PUT /users/:id
 *
 * Actualiza la información de un usuario existente.
 * Solo puede hacerlo el Administrador del sistema.
 */
router.put(
  "/:id",
  authorizeRoles(ROLE_IDS.SYSTEM_ADMIN),
  validateUserId,
  validateUpdateUser,
  usersController.updateUser,
);

/**
 * DELETE /users/:id
 *
 * Realiza un borrado lógico del usuario identificado por ID.
 */
router.delete(
  "/:id",
  authorizeRoles(ROLE_IDS.SYSTEM_ADMIN),
  validateUserId,
  usersController.softDelete,
);

/**
 * PATCH /users/:id/status
 *
 * Actualiza solo el estado del usuario.
 */
router.patch(
  "/:id/status",
  authorizeRoles(ROLE_IDS.SYSTEM_ADMIN),
  validateUserId,
  validateStatus,
  usersController.updateStatus,
);

module.exports = router;
