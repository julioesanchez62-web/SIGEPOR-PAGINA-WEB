const authRoutes = require('./auth.routes');

module.exports = authRoutes;
const express = require('express');
const router = express.Router();

const usersModule = require('../modules/users');
const authModule = require('../modules/auth');

router.use('/users', usersModule);
router.use('/auth', authModule);

module.exports = router;