const express = require('express');
const router = express.Router();
const controller = require('./reproduccion.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', controller.getEventos);
router.post('/', requireRole(['Administrador', 'Veterinario', 'Empleado']), controller.registrarEvento);
router.delete('/:id', requireRole(['Administrador', 'Veterinario']), controller.eliminarEvento);

module.exports = router;
