// Servicio de autenticación.
// Aquí reside la lógica de negocio relacionada con login, validación y manejo de credenciales.
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRepository = require("./auth.repository");

/**
 * Autentica un usuario mediante correo y contraseña.
 */
async function login(credentials) {
  const { correo, contrasena } = credentials;

  const user = await authRepository.findByEmail(correo);

  /*
   * Se utiliza el mismo mensaje cuando el correo no existe
   * o la contraseña es incorrecta.
   *
   * Esto evita revelar qué correos están registrados.
   */
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.estado !== 1) {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(contrasena, user.contrasena);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const tokenPayload = {
    idUsuario: user.idUsuario,
    correo: user.correo,
    idRol: user.idRol,
    rol: user.rol,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
    algorithm: "HS256",
  });

  return {
    message: "Login successful",
    data: {
      user: {
        idUsuario: user.idUsuario,
        nombre: user.nombre,
        correo: user.correo,
        estado: user.estado,
        idRol: user.idRol,
        rol: user.rol,
      },
      token,
    },
  };
}

module.exports = {
  login,
};
