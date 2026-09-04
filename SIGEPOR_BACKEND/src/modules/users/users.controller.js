/**
 * Controller del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Orquestar el flujo: recibir request → llamar service → responder
 * - Extraer datos de req.body y req.params
 * - Responder con códigos HTTP correctos
 */

const usersService = require('./users.service');

/**
 * Crear nuevo usuario
 * POST /users
 */
async function createUser(req, res, next) {
  try {
    const { nombre, correo, contraseña, idRol } = req.body;
    const usuario = await usersService.createUser(nombre, correo, contraseña, idRol);
    
    // Entrega confirmación exitosa dinámica al Postman
    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: usuario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Iniciar sesión de usuario
 * POST /users/login
 * 🔥 FUNCIÓN INTEGRADA CON ÉXITO
 */
async function login(req, res, next) {
  try {
    const { correo, contraseña } = req.body;

    // Validación básica en la capa de controlador antes de procesar
    if (!correo || !contraseña) {
      return res.status(400).json({ 
        message: 'El correo y la contraseña son campos obligatorios' 
      });
    }

    // Delegamos la validación de credenciales a la capa de negocio (Service)
    const usuarioValido = await usersService.loginUser(correo, contraseña);

    if (!usuarioValido) {
      return res.status(401).json({ 
        message: 'Correo electrónico o contraseña incorrectos' 
      });
    }

    // Respuesta exitosa entregada al cliente HTTP (Postman / Frontend)
    return res.status(200).json({
      message: '¡Autenticación exitosa! Bienvenido al sistema SIGEPOR',
      data: {
        id: usuarioValido.id,
        nombre: usuarioValido.nombre,
        email: usuarioValido.email,
        idRol: usuarioValido.idRol
      }
    });
  } catch (error) {
    next(error); // Pasa el error al middleware global de errores
  }
}

/**
 * Obtener lista de usuarios
 * GET /users
 */
async function getUsers(req, res, next) {
  try {
    const usuarios = await usersService.getUsers();
    return res.status(200).json({
      message: 'Usuarios obtenidos exitosamente',
      data: usuarios
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener usuario por ID
 * GET /users/:id
 */
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await usersService.getUserById(id);
    return res.status(200).json({
      message: 'Usuario obtenido exitosamente',
      data: usuario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar usuario por ID
 * PUT /users/:id
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    
    // Ejecutamos la actualización esperando el servicio
    const usuario = await usersService.updateUser(id, datosActualizados);

    // 🔥 EL CAMBIO: Agregamos "return" para detener el código aquí y que no se cruce con el middleware de errores
    return res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      data: usuario
    });

  } catch (error) {
    // Si realmente hubiera un error de base de datos, va al middleware global
    next(error);
  }
}

/**
 * Actualizar parcialmente un usuario por ID (PATCH)
 * PATCH /users/:id
 */
async function patchUser(req, res, next) {
  try {
    const { id } = req.params;
    const datosParciales = req.body; // Aquí llega tu {"activo": 0} de Postman
    
    const usuario = await usersService.updateUser(id, datosParciales);

    return res.status(200).json({
      message: 'Usuario modificado parcialmente con éxito',
      data: usuario
    });
  } catch (error) {
    next(error);
  }
}
/**
 * Eliminar usuario por ID
 * DELETE /users/:id
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    
    // Delegamos la eliminación al servicio asíncrono
    await usersService.deleteUser(id);
    
    // 🔥 EL RETORNO IMPORTANTE: Corta la petición con éxito
    return res.status(200).json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  createUser,
  login, // <--- 🔥 AGREGADO AQUÍ EN LAS EXPORTACIONES
  getUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser
};
