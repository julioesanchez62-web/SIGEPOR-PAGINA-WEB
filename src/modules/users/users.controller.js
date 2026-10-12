/**
 * Controller del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Orquestar el flujo: recibir request → llamar service → responder
 * - Extraer datos de req.body y req.params
 * - Responder con códigos HTTP correctos
 */

const jwt = require('jsonwebtoken');
const usersService = require('./users.service');
const { JWT_SECRET } = require('../../middlewares/auth.middleware');

/**
 * 🟢 Asociado al botón: GUARDAR CAMBIOS
 * Crear nuevo usuario
 * POST /users
 * 
 * NOTA TÉCNICA DE INTEGRACIÓN A FUTURO:
 * - Para autenticación social con Google y Facebook se requerirán los paquetes:
 *   - 'passport'
 *   - 'passport-google-oauth20'
 *   - 'passport-facebook'
 * - Para verificación de teléfono con confirmación por SMS se requerirá:
 *   - 'twilio' (Twilio Verify API / Twilio SMS SDK)
 */
async function createUser(req, res, next) {
  try {
    const { nombre, correo, usuario: usuarioCustom, contraseña, idRol, telefono, requerirSMS } = req.body;

    // SEGURIDAD: Bloquear asignación del rol Administrador a peticiones públicas o sin privilegios
    if (Number(idRol) === 1 || String(idRol).toLowerCase() === 'administrador') {
      const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
      let requesterIsAdmin = false;

      if (authHeader) {
        try {
          const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
          const decoded = jwt.verify(token, JWT_SECRET);
          if (Number(decoded.idRol) === 1 || (decoded.rolNombre && decoded.rolNombre.toLowerCase() === 'administrador')) {
            requesterIsAdmin = true;
          }
        } catch (err) {
          requesterIsAdmin = false;
        }
      }

      if (!requesterIsAdmin) {
        return res.status(403).json({
          status: 'fail',
          message: 'Acceso denegado: Se requieren privilegios de Administrador autenticado para asignar el rol Administrador.'
        });
      }
    }

    // STUB PARA CONFIRMACIÓN POR SMS (Twilio SDK):
    if (requerirSMS && telefono) {
      console.log(`[SMS-STUB] Enviando código de confirmación por SMS vía Twilio al número: ${telefono}`);
      // Ejemplo de implementación con Twilio:
      // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({ body: 'Tu código SIGEPOR es: 123456', from: process.env.TWILIO_PHONE, to: telefono });
    }

    // Control de nulos antes de persistir para evitar errores con undefined en MySQL
    const telefono_db = (telefono !== undefined && telefono !== null && String(telefono).trim() !== '') 
      ? String(telefono).trim() 
      : null;

    const usuario = await usersService.createUser({
      nombre,
      correo,
      usuario: usuarioCustom,
      contraseña,
      idRol,
      telefono: telefono_db
    });

    // Enviar correo de bienvenida asíncrono con plantilla de SIGEPOR 2026
    const { sendWelcomeEmail } = require('../../utils/mailer');
    sendWelcomeEmail({
      email: correo,
      nombre,
      origen: 'formulario web'
    }).catch(err => console.error('[Welcome Mail Error]:', err.message));
    
    // Entrega confirmación exitosa dinámica al cliente HTTP
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
      token: usuarioValido.token,
      data: {
        id: usuarioValido.id,
        nombre: usuarioValido.nombre,
        email: usuarioValido.email || usuarioValido.correo,
        idRol: usuarioValido.idRol,
        rolNombre: usuarioValido.rolNombre,
        token: usuarioValido.token
      },
      user: usuarioValido
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
    
    return res.status(200).json({
      status: 'success',
      data: usuario,
      ...usuario
    });
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
    const { nombre, correo, usuario, contraseña, idRol, telefono } = req.body;
    
    // Control de nulos antes de persistir para evitar errores con undefined en MySQL
    const telefono_db = telefono !== undefined ? (telefono ? String(telefono).trim() : null) : null;

    const usuarioActualizado = await usersService.updateUser(id, { 
      nombre, 
      correo, 
      usuario, 
      contraseña, 
      idRol, 
      telefono: telefono_db 
    });
    
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

/**
 * Obtener perfil del usuario autenticado
 */
async function getProfile(req, res, next) {
  try {
    return res.status(200).json({
      status: 'success',
      user: req.user || null
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
  deleteUser,
  getProfile
};
