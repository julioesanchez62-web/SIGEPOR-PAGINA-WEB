const express = require("express");

const usersController = require("./users.controller");
const {
  validateCreateUser,
  validateUserId,
  validateUpdateUser,
  validateStatus,
} = require("./users.validator");

const router = express.Router();

/**
 * POST /users
 *
 * Valida los datos de creación y crea un nuevo usuario.
 */
router.post("/", validateCreateUser, usersController.createUser);

/**
 * GET /users
 *
 * Recupera todos los usuarios activos.
 */
router.get("/", usersController.getUsers);

/**
 * GET /users/:id
 *
 * Valida el ID y obtiene un usuario por su identificador.
 */
router.get("/:id", validateUserId, usersController.getUserById);

/**
 * PUT /users/:id
 *
 * Valida el ID y el cuerpo de la petición para actualizar un usuario.
 */
router.put(
  "/:id",
  validateUserId,
  validateUpdateUser,
  usersController.updateUser,
);

/**
 * DELETE /users/:id
 *
 * Valida el ID y realiza un borrado lógico del usuario.
 */
router.delete("/:id", validateUserId, usersController.softDelete);

/**
 * PATCH /users/:id/status
 *
 * Valida el ID y el estado para actualizar únicamente el estado de un usuario.
 */
router.patch(
  "/:id/status",
  validateUserId,
  validateStatus,
  usersController.updateStatus,
);

module.exports = router;
