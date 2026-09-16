const express = require('express');
const router = express.Router();

// Importar Controllers
const userController = require('../controllers/user.controller');
// const authController = require('../controllers/auth.controller');
// const inventoryController = require('../controllers/inventory.controller');
// const healthController = require('../controllers/health.controller');

/* ==========================================================================
   1. RUTAS PÚBLICAS Y DE PRUEBA
   ========================================================================== */
router.get('/health', (req, res) => res.json({ status: 'OK', message: 'SIGEPOR API running' }));

/* ==========================================================================
   2. DESACTIVADO TEMPORALMENTE: AUTENTICACIÓN GLOBAL
   ========================================================================== */
// router.use(verifyToken); <-- Comentado para no requerir token en ninguna ruta

/* ==========================================================================
   3. RUTAS LIBRES (Sin verificación de token ni roles)
   ========================================================================== */

// --- MÓDULO DE USUARIOS ---
router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);
router.delete('/users/:id', userController.deleteUser);
router.get('/perfil', userController.getProfile);

/* 
// --- MÓDULO DE CONTROL SALUD ---
router.post('/salud', healthController.createHealthRecord);
router.get('/salud', healthController.getHealthRecords);

// --- MÓDULO DE INVENTARIO ---
router.get('/inventario', inventoryController.getInventory);
router.post('/inventario', inventoryController.addInventory);
*/

module.exports = router;