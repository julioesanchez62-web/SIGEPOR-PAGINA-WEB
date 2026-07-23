const express = require("express");

const usersController = require("./users.controller");
const {
  validateCreateUser,
  validateUserId,
  validateUpdateUser,
} = require("./users.validator");

const router = express.Router();

/* POST - CREAR USUARIOS */
router.post("/", validateCreateUser, usersController.createUser);

/* GET - CONSULTAR TODOS LOS USUARIOS */
router.get("/", usersController.getUsers);

/** GET - CONSULTAR USUARIO POR ID */
router.get("/:id", validateUserId, usersController.getUserById);

/* PUT - ACTUALIZAR USUARIO */
router.put(
  "/:id",
  validateUserId,
  validateUpdateUser,
  usersController.updateUser,
);

/* DELETE - DESACTIVAR USUARIO */
router.delete("/:id", validateUserId, usersController.deactivateUser);

module.exports = router;
