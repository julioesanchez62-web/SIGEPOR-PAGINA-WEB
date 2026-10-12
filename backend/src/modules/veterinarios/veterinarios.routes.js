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

router.get('/', requireRole(['Administrador', 'Veterinario', 'Empleado']), veterinariosController.getVeterinarios);
router.get('/:id', requireRole(['Administrador', 'Veterinario', 'Empleado']), veterinariosController.getVeterinarioById);
router.post('/', requireRole(['Administrador']), veterinariosController.createVeterinario);
router.put('/:id', requireRole(['Administrador']), veterinariosController.updateVeterinario);
router.delete('/:id', requireRole(['Administrador']), veterinariosController.deleteVeterinario);

module.exports = router;
