const express = require('express');
const router = express.Router();
const controller = require('./sanidad.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

router.use(verifyToken);

// Endpoints de Vacunación (soporta compatibilidad directa con /vacunas y /api/vacunas)
router.get('/vacunas', controller.getVacunas);
router.post('/vacunas', requireRole(['Administrador', 'Veterinario', 'Empleado']), controller.registrarVacuna);
router.delete('/vacunas/:id', requireRole(['Administrador', 'Veterinario']), controller.eliminarVacuna);

// Endpoints de Enfermedades
router.get('/enfermedades', controller.getEnfermedades);
router.post('/enfermedades', requireRole(['Administrador', 'Veterinario']), controller.registrarEnfermedad);
router.delete('/enfermedades/:id', requireRole(['Administrador', 'Veterinario']), controller.eliminarEnfermedad);

module.exports = router;
