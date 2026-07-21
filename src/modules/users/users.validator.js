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

  req.body = {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    contrasena,
    idRol: parsedRoleId,
  };

  console.log("2. Validator aprobado. Ejecutando next()");
  return next();
}

module.exports = {
  validateCreateUser,
};
