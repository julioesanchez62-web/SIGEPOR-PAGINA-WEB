const express = require('express');

// Importar directamente el archivo de rutas del módulo
const usersRoutes = require('../modules/users/users.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SIGEPOR backend is running' });
});

// Módulo de usuarios
router.use('/api/users', usersRoutes);

module.exports = router;