/**
 * REGLAS DE NEGOCIO DEL SERVICIO DE USUARIOS
 *
 * 1. Validar que el correo no exista antes de registrar un usuario.
 * 2. Encriptar la contraseña antes de almacenarla en la base de datos.
 * 3. Verificar que el rol enviado exista en el sistema.
 * 4. Normalizar datos de entrada como nombre, correo y idRol.
 * 5. Evitar que el servicio maneje directamente HTTP o respuestas de Express.
 * 6. Lanzar errores con statusCode para que el controlador o middleware los procese.
 * 7. Centralizar la persistencia en el repositorio.
 * 8. Mantener la lógica de negocio separada del controlador y de las rutas.
 *
 * IMPORTANTE:
 * Este archivo representa la capa de negocio.
 * Aquí se aplican las reglas y validaciones del dominio.
 * El controlador solo recibe la petición, delega al servicio y responde al cliente.
 */

/**
 * CREAR USUARIO
 *
 * Esta función ejecuta la lógica necesaria para registrar un nuevo usuario.
 * Se valida la información, se encripta la contraseña y se guarda en la base de datos.
 */

// Importa bcrypt para encriptar la contraseña antes de guardarla.
const bcrypt = require("bcrypt");

// Importa el repositorio de usuarios para acceder a la base de datos.
const usersRepository = require("./users.repository");

// Función principal que aplica la lógica de negocio para crear un usuario.
async function create(userData) {
  // Registra la entrada al servicio para seguir el flujo de ejecución.
  console.log("4. Entró al service", userData);

  // Normaliza el nombre para evitar espacios innecesarios.
  const normalizedName =
    typeof userData.nombre === "string"
      ? userData.nombre.trim()
      : userData.nombre;
  const normalizedEmail =
    typeof userData.correo === "string"
      ? userData.correo.trim().toLowerCase()
      : userData.correo;
  // Convierte el idRol a número para mantener el formato consistente.
  const normalizedRoleId = Number(userData.idRol);

  // Consulta si ya existe un usuario con el mismo correo.
  const existingUser = await usersRepository.findByEmail(normalizedEmail);

  // Si el correo ya existe, se lanza un error de conflicto.
  if (existingUser) {
    const error = new Error("The email is already registered");
    error.statusCode = 409;
    throw error;
  }

  // Verifica que el rol indicado exista en la base de datos.
  const role = await usersRepository.findRoleById(normalizedRoleId);

  // Si el rol no existe, se lanza un error de recurso no encontrado.
  if (!role) {
    const error = new Error("The selected role does not exist");
    error.statusCode = 404;
    throw error;
  }

  // Encripta la contraseña antes de almacenarla.
  const hashedPassword = await bcrypt.hash(userData.contrasena, 10);

  // Construye el objeto del usuario con la contraseña ya protegida.
  const userToCreate = {
    nombre: normalizedName,
    correo: normalizedEmail,
    contrasena: hashedPassword,
    idRol: normalizedRoleId,
  };

  // Persiste el usuario en la base de datos usando el repositorio.
  const createdUser = await usersRepository.create(userToCreate);

  // Devuelve la respuesta del servicio al controlador.
  return {
    message: "User created successfully",
    data: createdUser,
  };
}

/**
 * CONSULTAR TODOS LOS USUARIOS
 *
 * Recupera la colección completa de usuarios desde el repositorio.
 */
async function findAll() {
  const users = await usersRepository.findAll();

  return {
    message: "Users retrieved successfully",
    data: users,
  };
}

/* GET - CONSULTAR USUARIO POR ID */

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
 * ACTUALIZAR USUARIO
 *
 * Modifica la información de un usuario existente.
 * Antes de actualizar, valida que el usuario y el rol existan.
 * 
 * 
¿Existe el usuario?
        ↓
¿El correo pertenece a otro usuario?
        ↓
¿Existe el rol?
        ↓
Actualizar
        ↓
Devolver usuario actualizado

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

/* DELETE - DESACTIVAR USUARIO

¿Existe el usuario?
¿Ya está inactivo?
*/

async function deactivate(idUsuario) {
  const existingUser = await usersRepository.findById(idUsuario);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (existingUser.estado === 0) {
    const error = new Error("User is already inactive");
    error.statusCode = 409;
    throw error;
  }

  const inactiveUser = await usersRepository.deactivate(idUsuario);

  return {
    message: "User deactivated successfully",
    data: inactiveUser,
  };
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  deactivate,
};
