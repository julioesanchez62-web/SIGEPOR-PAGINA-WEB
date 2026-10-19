/**
 * Rutas del módulo de veterinarios
 * Endpoints:
 * - GET    /api/veterinarios
 * - GET    /api/veterinarios/:id
 * - POST   /api/veterinarios
 * - PUT    /api/veterinarios/:id
 * - DELETE /api/veterinarios/:id
 */

const express = require('express');
const router = express.Router();
const veterinariosController = require('./veterinarios.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

router.use(verifyToken);

// Control de acceso RBAC estricto: El módulo de gestión de veterinarios es exclusivo para Administradores
router.get('/', requireRole(['Administrador', 1]), veterinariosController.getVeterinarios);
router.get('/:id', requireRole(['Administrador', 1]), veterinariosController.getVeterinarioById);
router.post('/', requireRole(['Administrador', 1]), veterinariosController.createVeterinario);
router.put('/:id', requireRole(['Administrador', 1]), veterinariosController.updateVeterinario);
router.delete('/:id', requireRole(['Administrador', 1]), veterinariosController.deleteVeterinario);

module.exports = router;
