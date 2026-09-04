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
 * 🟢 Asociado al botón: GUARDAR CAMBIOS
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
    const identificador = req.body.identificador || req.body.correo || req.body.usuario;
    const { contraseña } = req.body;

    // Validación básica en la capa de controlador antes de procesar
    if (!identificador || !contraseña) {
      return res.status(400).json({ 
        message: 'El usuario o correo y la contraseña son campos obligatorios' 
      });
    }

    // Delegamos la validación de credenciales a la capa de negocio (Service)
    const usuarioValido = await usersService.loginUser(identificador, contraseña);

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
 * Obtener lista de todos los usuarios
 * GET /users
 */
async function getUsers(req, res, next) {
  try {
    const usuarios = await usersService.getAllUsers();
    return res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
}

/**
 * 🔵 Asociado al botón: CONSULTAR USUARIO
 * Obtener usuario por ID
 * GET /users/:id
 */
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await usersService.getUserById(id);
    
    if (!usuario) {
      return res.status(404).json({
        message: `El usuario con ID ${id} no fue encontrado`
      });
    }
    
    return res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
}

/**
 * 🔵 Asociado al botón: ACTUALIZAR USUARIO
 * Actualizar usuario completo por ID
 * PUT /users/:id
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, correo, contraseña, idRol } = req.body;
    
    const usuarioActualizado = await usersService.updateUser(id, { nombre, correo, contraseña, idRol });
    
    return res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: usuarioActualizado
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualización parcial de atributos
 * PATCH /users/:id
 */
async function patchUser(req, res, next) {
  try {
    const { id } = req.params;
    const camposCambiados = req.body;
    
    const usuarioModificado = await usersService.patchUser(id, camposCambiados);
    
    return res.status(200).json({
      message: 'Cambios parciales aplicados correctamente',
      user: usuarioModificado
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🔴 Asociado al botón: BORRAR USUARIO
 * Eliminar usuario por ID
 * DELETE /users/:id
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await usersService.deleteUser(id);
    
    return res.status(200).json({
      message: `Usuario con ID ${id} eliminado correctamente del sistema`
    });
  } catch (error) {
    next(error);
  }
}

// Exportación unificada de todas las funciones mapeadas en las rutas
module.exports = {
  createUser,
  login,
  getUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser
};
