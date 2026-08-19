/**
 * Servicio de usuarios.
 *
 * Contiene la lógica de negocio propia del recurso `users`.
 * Esta capa no debe manejar respuestas HTTP directamente.
 */

const bcrypt = require("bcrypt");
const usersRepository = require("./users.repository");

/**
 * Crea un usuario nuevo.
 *
 * Normaliza datos, valida el correo y el rol, cifra la contraseña
 * y delega la creación al repositorio.
 */
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

/**
 * Obtiene todos los usuarios activos.
 */
async function findAll() {
  const users = await usersRepository.findAll();

  return {
    message: "Users retrieved successfully",
    data: users,
  };
}

/**
 * Obtiene un usuario por su identificador.
 */
async function findById(idUsuario) {
  const user = await usersRepository.findById(idUsuario);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    message: "User retrieved successfully",
    data: user,
  };
}

/**
 * Actualiza un usuario existente.
 *
 * Verifica existencia del usuario y del rol,
 * y comprueba que el correo no esté en uso por otro registro.
 */
async function update(idUsuario, userData) {
  const existingUser = await usersRepository.findById(idUsuario);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const userWithSameEmail = await usersRepository.findByEmailExcludingId(
    userData.correo,
    idUsuario,
  );

  if (userWithSameEmail) {
    const error = new Error("The email is already registered by another user");
    error.statusCode = 409;
    throw error;
  }

  const role = await usersRepository.findRoleById(userData.idRol);

  if (!role) {
    const error = new Error("The selected role does not exist");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await usersRepository.update(idUsuario, userData);

  return {
    message: "User updated successfully",
    data: updatedUser,
  };
}

/**
 * Elimina un usuario de forma lógica.
 *
 * Cambia su estado y marca la fecha de eliminación sin borrar la fila.
 */
async function softDelete(idUsuario) {
  const existingUser = await usersRepository.findById(idUsuario);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await usersRepository.softDelete(idUsuario);

  return {
    message: "User deleted successfully",
  };
}

/**
 * Actualiza únicamente el estado de un usuario.
 *
 * Verifica existencia del usuario y evita cambios redundantes.
 */
async function updateStatus(idUsuario, status) {
  const existingUser = await usersRepository.findById(idUsuario);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const newStatus = status ? 1 : 0;

  if (existingUser.estado === newStatus) {
    const statusText = newStatus === 1 ? "active" : "inactive";

    const error = new Error(`User is already ${statusText}`);
    error.statusCode = 409;
    throw error;
  }

  const updatedUser = await usersRepository.updateStatus(idUsuario, newStatus);

  return {
    message: "User status updated successfully",
    data: updatedUser,
  };
}

/**
 * Returns the authenticated user's profile.
 */
async function getAuthenticatedUser(idUsuario) {
  const user = await usersRepository.findAuthenticatedUserById(idUsuario);

  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;

    throw error;
  }

  return {
    message: "Authenticated user retrieved successfully",
    data: user,
  };
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  softDelete,
  updateStatus,
  getAuthenticatedUser,
};
