const express = require('express');
const router = express.Router();
const controller = require('./inventario.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

router.use(verifyToken);

// Alimentos
router.get('/alimentos', controller.getAlimentos);
router.post('/alimentos', requireRole(['Administrador', 'Empleado']), controller.registrarAlimento);
router.delete('/alimentos/:id', requireRole(['Administrador']), controller.eliminarAlimento);

// Corrales
router.get('/corrales', controller.getCorrales);
router.post('/corrales', requireRole(['Administrador', 'Empleado']), controller.registrarCorral);

// Proveedores
router.get('/proveedores', controller.getProveedores);
router.post('/proveedores', requireRole(['Administrador']), controller.registrarProveedor);

module.exports = router;
