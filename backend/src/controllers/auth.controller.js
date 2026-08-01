const authService = require('../services/auth.service');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { sendSuccess, sendError } = require('../utils/response');

async function register(req, res) {
  const validation = validateRegister(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, 'Datos inválidos', validation.errors);
  }

  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, 201, result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'No se pudo registrar el veterinario');
  }
}

async function login(req, res) {
  const validation = validateLogin(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, 'Datos inválidos', validation.errors);
  }

  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'No se pudo iniciar sesión');
  }
}

async function profile(req, res) {
  try {
    const result = await authService.getProfile(req.user.id);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'No se pudo cargar el perfil');
  }
}

module.exports = {
  register,
  login,
  profile
};
