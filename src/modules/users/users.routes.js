const express = require("express");
const usersController = require("./users.controller");
const { validateCreateUser } = require("./users.validator");

const router = express.Router();

router.post("/", validateCreateUser, usersController.createUser);

module.exports = router;
