/**
 * Valida los datos recibidos para iniciar sesión.
 */
function validateLogin(req, res, next) {
  const { correo, contrasena } = req.body || {}; // evita que el servidor genere un error 500 cuando Postman no envía un body.

  if (!correo || !contrasena) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof correo !== "string") {
    const error = new Error("Email must be a string");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof contrasena !== "string") {
    const error = new Error("Password must be a string");
    error.statusCode = 400;
    return next(error);
  }

  const normalizedEmail = correo.trim().toLowerCase();

  if (!normalizedEmail) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    return next(error);
  }

  if (!normalizedEmail.includes("@")) {
    const error = new Error("Email format is invalid");
    error.statusCode = 400;
    return next(error);
  }

  if (!contrasena.trim()) {
    const error = new Error("Password is required");
    error.statusCode = 400;
    return next(error);
  }

  /*
   * Se normaliza el correo antes de enviarlo
   * al Controller y al Service.
   */
  req.body.correo = normalizedEmail;

  return next();
}

module.exports = {
  validateLogin,
};
