const express = require('express');
const router = express.Router();

// Importar los routers modulares de la aplicación
const porcinosRoutes = require('../modules/porcinos/porcinos.routes');
const usersRoutes = require('../modules/users/users.routes');
const authRoutes = require('../modules/auth/auth.routes');
const veterinariosRoutes = require('../modules/veterinarios/veterinarios.routes');
const inventarioRoutes = require('../modules/inventario/inventario.routes');
const sanidadRoutes = require('../modules/sanidad/sanidad.routes');
const reproduccionRoutes = require('../modules/reproduccion/reproduccion.routes');
const reportesRoutes = require('../modules/reportes/reportes.routes');

// Controller legado para perfil
const userController = require('../controllers/user.controller');

/* ==========================================================================
   1. RUTAS DE COMPROBACIÓN (HEALTH)
   ========================================================================== */
router.get(['/health', '/api/health'], (req, res) => res.json({ status: 'OK', message: 'SIGEPOR API running' }));
router.get('/perfil', userController.getProfile);

/* ==========================================================================
   2. MONTAJE DE MÓDULOS DEL SISTEMA (Soporta prefijos con /api y sin /api)
   ========================================================================== */

// --- MÓDULO DE PORCINOS ---
router.use('/api/porcinos', porcinosRoutes);
router.use('/porcinos', porcinosRoutes);

// --- MÓDULO DE USUARIOS ---
router.use('/api/users', usersRoutes);
router.use('/users', usersRoutes);

// --- MÓDULO DE AUTENTICACIÓN ---
router.use('/api/auth', authRoutes);
router.use('/auth', authRoutes);

// --- MÓDULO DE VETERINARIOS ---
router.use('/api/veterinarios', veterinariosRoutes);
router.use('/veterinarios', veterinariosRoutes);

// --- MÓDULO DE INVENTARIO ---
router.use('/api/inventario', inventarioRoutes);
router.use('/inventario', inventarioRoutes);

// --- MÓDULO DE SANIDAD Y VACUNAS ---
router.use('/api/sanidad', sanidadRoutes);
router.use('/sanidad', sanidadRoutes);
router.use('/api/vacunas', sanidadRoutes);
router.use('/vacunas', sanidadRoutes);

// --- MÓDULO DE REPRODUCCIÓN ---
router.use('/api/reproduccion', reproduccionRoutes);
router.use('/reproduccion', reproduccionRoutes);

// --- MÓDULO DE REPORTES Y ALERTAS ---
router.use('/api/reportes', reportesRoutes);
router.use('/reportes', reportesRoutes);

module.exports = router;