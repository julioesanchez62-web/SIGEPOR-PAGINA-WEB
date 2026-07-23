// Importa el servicio de usuarios para delegar la lógica de negocio.
const usersService = require("./users.service");

/* POST - CREAR USUARIOS */

// Función del controlador encargada de recibir la petición de creación de usuario.
async function createUser(req, res, next) {
  // Registra la entrada al controlador para seguir el flujo.
  console.log("3. Entró al controller");

  try {
    // Llama al servicio con el cuerpo de la solicitud ya validado.
    const result = await usersService.create(req.body);

    // Muestra que el servicio respondió correctamente.
    console.log("5. Controller recibió respuesta del service");

    // Envía una respuesta HTTP 201 con el resultado obtenido.
    return res.status(201).json(result);
  } catch (error) {
    // Si el servicio lanzó un error, lo pasa al middleware global de errores.
    next(error);
  }
}

/*  GET - CONSULTAR USUARIOS */

async function getUsers(req, res, next) {
  try {
    const result = await usersService.findAll();

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/* GET - CONSULTAR USUARIO POR ID */
async function getUserById(req, res, next) {
  try {
    const result = await usersService.findById(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/* PUT - ACTUALIZAR USUARIO */
async function updateUser(req, res, next) {
  try {
    const result = await usersService.update(req.params.id, req.body);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/* DELETE - DESACTIVAR USUARIO */
async function deactivateUser(req, res, next) {
  try {
    const result = await usersService.deactivate(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

// Exporta la función del controlador para usarla desde las rutas.
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
};
