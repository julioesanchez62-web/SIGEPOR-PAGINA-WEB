const express = require('express');

// Importar los archivos de rutas de todos los módulos del sistema
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const veterinariosRoutes = require('../modules/veterinarios/veterinarios.routes');
const porcinosRoutes = require('../modules/porcinos/porcinos.routes');
const reproduccionRoutes = require('../modules/reproduccion/reproduccion.routes');
const sanidadRoutes = require('../modules/sanidad/sanidad.routes');
const inventarioRoutes = require('../modules/inventario/inventario.routes');
const reportesRoutes = require('../modules/reportes/reportes.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SIGEPOR backend is running' });
});

// Módulos principales con alias de seguridad (con y sin /api/)
router.use('/api/auth', authRoutes);
router.use('/auth', authRoutes);

router.use('/api/users', usersRoutes);
router.use('/users', usersRoutes);

router.use('/api/veterinarios', veterinariosRoutes);
router.use('/veterinarios', veterinariosRoutes);

router.use('/api/porcinos', porcinosRoutes);
router.use('/porcinos', porcinosRoutes);

router.use('/api/reproduccion', reproduccionRoutes);
router.use('/reproduccion', reproduccionRoutes);

router.use('/api/sanidad', sanidadRoutes);
router.use('/sanidad', sanidadRoutes);

router.use('/api/vacunas', sanidadRoutes);
router.use('/vacunas', sanidadRoutes);

router.use('/api/inventario', inventarioRoutes);
router.use('/inventario', inventarioRoutes);

router.use('/api/reportes', reportesRoutes);
router.use('/reportes', reportesRoutes);

module.exports = router;