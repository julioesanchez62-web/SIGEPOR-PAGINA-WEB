const { body, param, validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ ok: false, errores: errores.array() });
  }
  next();
};

const crearUsuarioValidador = [
  body('nombre_completo').notEmpty().withMessage('El nombre completo es obligatorio'),
  body('correo').isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
  body('direccion').optional().isString(),
  body('telefono').optional().isString(),
  body('id_rol').isInt().withMessage('El id_rol debe ser un número entero'),
  body('contraseña').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validarCampos
];

const actualizarUsuarioValidador = [
  param('id').isInt().withMessage('El ID del usuario debe ser un número entero'),
  body('nombre_completo').notEmpty().withMessage('El nombre completo es obligatorio'),
  body('correo').isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
  body('direccion').optional().isString(),
  body('telefono').optional().isString(),
  body('id_rol').isInt().withMessage('El id_rol debe ser un número entero'),
  validarCampos
];

const validarIdParam = [
  param('id').isInt().withMessage('El ID debe ser un número entero'),
  validarCampos
];

module.exports = {
  crearUsuarioValidador,
  actualizarUsuarioValidador,
  validarIdParam
};