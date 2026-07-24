/**
 * Validadores del módulo de usuarios.
 *
 * Contienen reglas de validación para las rutas de creación,
 * actualización y consulta de usuarios.
 */

// Middleware que valida los datos de creación de un usuario antes de continuar con el flujo.
function validateCreateUser(req, res, next) {
  console.log("1. Entró al validator");

  const { nombre, correo, contrasena, idRol } = req.body;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    console.log("Validator detuvo: nombre inválido");
    const error = new Error("Name is required");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof correo !== "string" || correo.trim() === "") {
    console.log("Validator detuvo: correo requerido");
    const error = new Error("Email is required");
    error.statusCode = 400;
    return next(error);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(correo.trim())) {
    console.log("Validator detuvo: formato de correo inválido");
    const error = new Error("Email format is invalid");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof contrasena !== "string" || contrasena.trim() === "") {
    console.log("Validator detuvo: contraseña requerida");
    const error = new Error("Password is required");
    error.statusCode = 400;
    return next(error);
  }

  if (contrasena.length < 6) {
    console.log("Validator detuvo: contraseña corta");
    const error = new Error("Password must contain at least 6 characters");
    error.statusCode = 400;
    return next(error);
  }

  if (idRol === undefined || idRol === null || idRol === "") {
    console.log("Validator detuvo: rol requerido");
    const error = new Error("Role is required");
    error.statusCode = 400;
    return next(error);
  }

  const parsedRoleId = Number(idRol);

  if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
    console.log("Validator detuvo: rol inválido");
    const error = new Error("Role must be a positive integer");
    error.statusCode = 400;
    return next(error);
  }

  // Normaliza los valores antes de continuar con el siguiente middleware.
  req.body = {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    contrasena,
    idRol: parsedRoleId,
  };

  console.log("2. Validator aprobado. Ejecutando next()");
  return next();
}

/**
 * Valida que el identificador de usuario sea un número entero positivo.
 */
function validateUserId(req, res, next) {
  const { id } = req.params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    const error = new Error("User ID must be a positive integer");
    error.statusCode = 400;
    return next(error);
  }

  req.params.id = numericId;
  return next();
}

/**
 * Valida los campos necesarios para actualizar un usuario.
 */
function validateUpdateUser(req, res, next) {
  const { nombre, correo, idRol } = req.body || {};

  if (!nombre || !correo || idRol === undefined) {
    const error = new Error("Name, email and role ID are required");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof nombre !== "string" || nombre.trim() === "") {
    const error = new Error("Name must be a non-empty string");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof correo !== "string" || correo.trim() === "") {
    const error = new Error("Email must be a non-empty string");
    error.statusCode = 400;
    return next(error);
  }

  if (!Number.isInteger(Number(idRol)) || Number(idRol) <= 0) {
    const error = new Error("Role ID must be a positive integer");
    error.statusCode = 400;
    return next(error);
  }

  next();
}

/**
 * Valida que el campo `status` esté presente y sea un booleano.
 */
function validateStatus(req, res, next) {
  const { status } = req.body;

  if (status === undefined) {
    const error = new Error("Status is required");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof status !== "boolean") {
    const error = new Error("Status must be a boolean value");
    error.statusCode = 400;
    return next(error);
  }

  next();
}

// Exporta los validadores del módulo users.
module.exports = {
  validateCreateUser,
  validateUserId,
  validateUpdateUser,
  validateStatus,
};
