const { Router } = require('express');
const usersController = require('./users.controller');
const {
  crearUsuarioValidador,
  actualizarUsuarioValidador,
  validarIdParam
} = require('./users.validator');

const router = Router();

router.get('/', usersController.obtenerTodos);
router.get('/:id', validarIdParam, usersController.obtenerPorId);
router.post('/', crearUsuarioValidador, usersController.crear);
router.put('/:id', actualizarUsuarioValidador, usersController.actualizar);
router.delete('/:id', validarIdParam, usersController.eliminar);

module.exports = router;