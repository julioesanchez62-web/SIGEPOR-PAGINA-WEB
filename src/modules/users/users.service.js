/** reglas de negocio:
 * verificar que el correo no exista;
encriptar la contraseña;
validar que el rol exista;
enviar un correo de bienvenida;
registrar una auditoría en MongoDB;
generar un token de activación.

Todo eso pertenece al negocio, no al controlador.
 * 
 */

const bcrypt = require("bcrypt");
const usersRepository = require("./users.repository");

async function create(userData) {
  console.log("4. Entró al service", userData);

  const normalizedName =
    typeof userData.nombre === "string"
      ? userData.nombre.trim()
      : userData.nombre;
  const normalizedEmail =
    typeof userData.correo === "string"
      ? userData.correo.trim().toLowerCase()
      : userData.correo;
  const normalizedRoleId = Number(userData.idRol);

  const existingUser = await usersRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("The email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const role = await usersRepository.findRoleById(normalizedRoleId);

  if (!role) {
    const error = new Error("The selected role does not exist");
    error.statusCode = 404;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(userData.contrasena, 10);

  const userToCreate = {
    nombre: normalizedName,
    correo: normalizedEmail,
    contrasena: hashedPassword,
    idRol: normalizedRoleId,
  };

  const createdUser = await usersRepository.create(userToCreate);

  return {
    message: "User created successfully",
    data: createdUser,
  };
}

module.exports = {
  create,
};
