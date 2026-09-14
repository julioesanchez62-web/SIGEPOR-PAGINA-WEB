const express = require('express');
const router = express.Router();
const controller = require('./porcinos.controller');

// Rutas de porcinos (las rutas específicas DEBEN ir antes que las rutas con parámetros como :id)
router.get('/', controller.getPorcinos);
router.get('/veterinarios', controller.obtenerVeterinarios);
router.get('/:id', controller.getPorcinoById);
router.post('/', controller.registrarPorcino);
router.put('/:id', controller.actualizarPorcino);
router.delete('/:id', controller.eliminarPorcino);

module.exports = router;