// Controlador de autenticación.
// Aquí se reciben las solicitudes HTTP y se delegan las operaciones al servicio correspondiente.
const authService = require("./auth.service");

/**
 * POST /api/auth/login
 *
 * Inicia sesión utilizando correo y contraseña.
 */
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
