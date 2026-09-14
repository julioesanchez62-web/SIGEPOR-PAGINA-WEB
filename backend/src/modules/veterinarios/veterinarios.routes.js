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

router.get('/', veterinariosController.getVeterinarios);
router.get('/:id', veterinariosController.getVeterinarioById);
router.post('/', veterinariosController.createVeterinario);
router.put('/:id', veterinariosController.updateVeterinario);
router.delete('/:id', veterinariosController.deleteVeterinario);

module.exports = router;
