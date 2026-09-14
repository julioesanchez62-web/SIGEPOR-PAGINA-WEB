const express = require('express');

// Importar directamente el archivo de rutas de los módulos
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const veterinariosRoutes = require('../modules/veterinarios/veterinarios.routes');
const porcinosRoutes = require('../modules/porcinos/porcinos.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SIGEPOR backend is running' });
});

// Módulos principales
router.use('/api/auth', authRoutes);
router.use('/api/users', usersRoutes);
router.use('/api/veterinarios', veterinariosRoutes);
router.use('/api/porcinos', porcinosRoutes);

module.exports = router;