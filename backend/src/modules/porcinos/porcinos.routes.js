const express = require('express');
const router = express.Router();
const controller = require('./porcinos.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

// Requerir autenticación JWT para todos los endpoints de porcinos
router.use(verifyToken);

// Rutas de porcinos (las rutas específicas DEBEN ir antes que las rutas con parámetros como :id)
router.get('/', controller.getPorcinos);
router.get('/veterinarios', controller.obtenerVeterinarios);
router.get('/:id', controller.getPorcinoById);
router.post('/', requireRole(['Administrador', 'Veterinario', 'Empleado']), controller.registrarPorcino);
router.put('/:id', requireRole(['Administrador', 'Veterinario', 'Empleado']), controller.actualizarPorcino);
router.delete('/:id', requireRole(['Administrador', 'Veterinario']), controller.eliminarPorcino);

module.exports = router;