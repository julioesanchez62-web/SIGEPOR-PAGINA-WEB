const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authValidator = require('./auth.validator');

// POST /api/auth/login
router.post('/login', authValidator.validateLogin, authController.login);

module.exports = router;