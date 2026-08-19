const express = require("express");

const authController = require("./auth.controller");
const { validateLogin } = require("./auth.validator");

const router = express.Router();

/**
 * POST /api/auth/login
 */
router.post("/login", validateLogin, authController.login);

module.exports = router;
