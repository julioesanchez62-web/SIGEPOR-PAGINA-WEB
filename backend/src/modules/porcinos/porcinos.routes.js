const express = require('express');
const router = express.Router();
const { registrarPorcino, obtenerVeterinarios } = require('./porcinoscontrollers');

// Rutas del módulo
router.post('/', registrarPorcino); 
router.get('/veterinarios', obtenerVeterinarios); // URL: http://localhost:3001/api/porcinos/veterinarios

module.exports = router;