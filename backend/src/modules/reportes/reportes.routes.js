const express = require('express');
const router = express.Router();
const controller = require('./reportes.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/alertas', controller.getAlertas);
router.get('/trazabilidad/:id', controller.getTrazabilidad);
router.get('/exportar/:tipo', requireRole(['Administrador', 'Veterinario', 'Empleado']), controller.exportarDatos);

module.exports = router;
