// Middleware que valida los datos de creación de un usuario antes de continuar con el flujo.
function validateCreateUser(req, res, next) {
  // Registro de entrada para rastrear el paso del validador.
  console.log("1. Entró al validator");

  // Obtiene los campos necesarios desde el cuerpo de la solicitud.
  const { nombre, correo, contrasena, idRol } = req.body;

  // Valida que el nombre sea un texto no vacío.
  if (typeof nombre !== "string" || nombre.trim() === "") {
    console.log("Validator detuvo: nombre inválido");

    const error = new Error("Name is required");
    error.statusCode = 400;
    return next(error);
  }

  // Valida que el correo exista y tenga un formato válido.
  if (typeof correo !== "string" || correo.trim() === "") {
    console.log("Validator detuvo: correo requerido");

    const error = new Error("Email is required");
    error.statusCode = 400;
    return next(error);
  }

  // Expresión regular para validar el formato de correo electrónico.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Si el correo no cumple la expresión, se bloquea la solicitud.
  if (!emailRegex.test(correo.trim())) {
    console.log("Validator detuvo: formato de correo inválido");

    const error = new Error("Email format is invalid");
    error.statusCode = 400;
    return next(error);
  }

  // Valida que la contraseña exista y sea una cadena de texto.
  if (typeof contrasena !== "string" || contrasena.trim() === "") {
    console.log("Validator detuvo: contraseña requerida");

    const error = new Error("Password is required");
    error.statusCode = 400;
    return next(error);
  }

  // Verifica que la contraseña tenga al menos 6 caracteres.
  if (contrasena.length < 6) {
    console.log("Validator detuvo: contraseña corta");

    const error = new Error("Password must contain at least 6 characters");
    error.statusCode = 400;
    return next(error);
  }

  // Verifica que el rol haya sido enviado.
  if (idRol === undefined || idRol === null || idRol === "") {
    console.log("Validator detuvo: rol requerido");

    const error = new Error("Role is required");
    error.statusCode = 400;
    return next(error);
  }

  // Convierte el rol a número y valida que sea un entero positivo.
  const parsedRoleId = Number(idRol);

  if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
    console.log("Validator detuvo: rol inválido");

    const error = new Error("Role must be a positive integer");
    error.statusCode = 400;
    return next(error);
  }

  // Normaliza el cuerpo de la solicitud antes de pasar al siguiente middleware.
  req.body = {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    contrasena,
    idRol: parsedRoleId,
  };

  // Indica que la validación fue correcta y que puede continuar el flujo.
  console.log("2. Validator aprobado. Ejecutando next()");
  return next();
}

/* GET - CONSULTAR USUARIO POR ID */

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

/* PUT - ACTUALIZAR USUARIO */
function validateUpdateUser(req, res, next) {
  const { nombre, correo, estado, idRol } = req.body || {};

  if (typeof nombre !== "string" || !nombre.trim()) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof correo !== "string" || !correo.trim()) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    return next(error);
  }

  const normalizedEmail = correo.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error("Email format is invalid");
    error.statusCode = 400;
    return next(error);
  }

  const normalizedStatus = Number(estado);

  if (
    !Number.isInteger(normalizedStatus) ||
    ![0, 1].includes(normalizedStatus)
  ) {
    const error = new Error("Status must be 0 or 1");
    error.statusCode = 400;
    return next(error);
  }

  const normalizedRoleId = Number(idRol);

  if (!Number.isInteger(normalizedRoleId) || normalizedRoleId <= 0) {
    const error = new Error("Role ID must be a positive integer");

    error.statusCode = 400;
    return next(error);
  }

  req.body = {
    nombre: nombre.trim(),
    correo: normalizedEmail,
    estado: normalizedStatus,
    idRol: normalizedRoleId,
  };

  return next();
}

// Exporta el validador para ser usado en las rutas del módulo users.
module.exports = {
  validateCreateUser,
  validateUserId,
  validateUpdateUser,
};
