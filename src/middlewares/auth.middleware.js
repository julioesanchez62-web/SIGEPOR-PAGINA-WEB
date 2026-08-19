const jwt = require("jsonwebtoken");

/**
 * Verifica el token JWT enviado por el cliente.
 *
 * El token debe llegar en el encabezado:
 * Authorization: Bearer <token>
 */
function authenticateToken(req, res, next) {
  // Obtiene el encabezado Authorization de la solicitud.
  const authorizationHeader = req.headers.authorization;

  // Valida que el encabezado haya sido enviado.
  if (!authorizationHeader) {
    const error = new Error("Authentication token is required");
    error.statusCode = 401;

    return next(error);
  }

  /*
   * Divide el encabezado en dos partes:
   *
   * Bearer eyJhbGciOiJIUzI1Ni...
   *
   * scheme = Bearer
   * token  = eyJhbGciOiJIUzI1Ni...
   */
  const [scheme, token] = authorizationHeader.split(" ");

  // Valida la estructura del encabezado.
  if (scheme !== "Bearer" || !token) {
    const error = new Error("Invalid authorization format. Use Bearer token");
    error.statusCode = 401;

    return next(error);
  }

  try {
    // Verifica la firma, estructura y vigencia del token.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    /*
     * Guarda los datos decodificados en req.user.
     *
     * Estos datos estarán disponibles en los siguientes
     * middlewares y controladores.
     */
    req.user = decodedToken;

    // Permite que la solicitud continúe.
    return next();
  } catch (error) {
    // El token existe, pero ya expiró.
    if (error.name === "TokenExpiredError") {
      const expiredTokenError = new Error("Authentication token has expired");

      expiredTokenError.statusCode = 401;

      return next(expiredTokenError);
    }

    // El token fue alterado, está incompleto o tiene una firma incorrecta.
    if (error.name === "JsonWebTokenError") {
      const invalidTokenError = new Error("Invalid authentication token");

      invalidTokenError.statusCode = 401;

      return next(invalidTokenError);
    }

    // Envía cualquier otro error al middleware global.
    return next(error);
  }
}

/**
 * Autoriza el acceso según los identificadores de rol permitidos.
 *
 * Ejemplo:
 * authorizeRoles(1, 2, 4)
 */
function authorizeRoles(...allowedRoleIds) {
  return function authorizationMiddleware(req, res, next) {
    // Verifica que authenticateToken se haya ejecutado previamente.
    if (!req.user) {
      const error = new Error("Authenticated user information is required");

      error.statusCode = 401;

      return next(error);
    }

    // Obtiene y normaliza el identificador del rol incluido en el JWT.
    const userRoleId = Number(req.user.idRol);

    // Verifica que el token contenga un rol válido.
    if (!Number.isInteger(userRoleId)) {
      const error = new Error("User role information is missing");

      error.statusCode = 403;

      return next(error);
    }

    // Normaliza los roles permitidos.
    const normalizedAllowedRoleIds = allowedRoleIds.map(Number);

    // Verifica si el rol del usuario está autorizado.
    if (!normalizedAllowedRoleIds.includes(userRoleId)) {
      const error = new Error(
        "You do not have permission to perform this action",
      );

      error.statusCode = 403;

      return next(error);
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
