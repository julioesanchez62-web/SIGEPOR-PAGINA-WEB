/**
 * Servicio del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Contener la lógica de negocio del módulo de usuarios
 * - Coordinar llamadas al repositorio (users.repository)
 * - Realizar validaciones lógicas complejas (ej: verificar si un correo ya existe)
 * - NO maneja directamente req ni res de HTTP
 * - NO ejecuta SQL directamente
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersRepository = require('./users.repository');
const veterinariosRepository = require('../veterinarios/veterinarios.repository');
const { JWT_SECRET, ROLES } = require('../../middlewares/auth.middleware');

/**
  * 🟢 Lógica para: GUARDAR CAMBIOS
  * Crear un nuevo usuario en el sistema con contraseña encriptada (Bcrypt)
  */
async function createUser(datosOParam, correoArg, contrasenaArg, idRolArg) {
  let nombre, correo, usuario, contraseña, idRol, telefono;

  if (typeof datosOParam === 'object' && datosOParam !== null) {
    nombre = datosOParam.nombre;
    correo = datosOParam.correo;
    usuario = datosOParam.usuario;
    contraseña = datosOParam.contraseña;
    idRol = datosOParam.idRol;
    telefono = datosOParam.telefono;
  } else {
    nombre = datosOParam;
    correo = correoArg;
    contraseña = contrasenaArg;
    idRol = idRolArg;
  }

  const rolDefecto = Number(idRol) || 2;
  const salt = await bcrypt.genSalt(10);
  const hashContrasena = await bcrypt.hash(contraseña, salt);

  const nuevoUsuario = await usersRepository.createUser({
    nombre,
    correo,
    usuario: usuario || (correo ? correo.split('@')[0] : 'user_' + Date.now()),
    contraseña: hashContrasena,
    idRol: rolDefecto,
    telefono: telefono || null
  });

  // Si se registra con rol 3 (Veterinario), sincronizar con la tabla veterinarios
  if (rolDefecto === 3) {
    try {
      const usuarioDefecto = (correo || '').split('@')[0];
      const vetExistente = await veterinariosRepository.findByEmailOrUsername(correo, usuarioDefecto);
      if (!vetExistente) {
        await veterinariosRepository.createVeterinario({
          nombre,
          email: correo,
          usuario: usuarioDefecto,
          contraseña: hashContrasena,
          fecha_registro: new Date().toISOString().slice(0, 10),
          activo: 1
        });
      }
    } catch (e) {
      console.warn('⚠️ Sincronización secundaria a tabla veterinarios omitida:', e.message);
    }
  }

  return nuevoUsuario;
}

/**
 * Lógica para iniciar sesión con Bcrypt y generación de Token JWT (Multi-tabla: Usuarios y Veterinarios)
 */
async function loginUser(identificador, contraseña) {
  let usuario = await usersRepository.findByEmailOrUsername(identificador);

  // Si no existe en la tabla de usuarios, buscar en la tabla de veterinarios
  if (!usuario) {
    const vet = await veterinariosRepository.findByEmailOrUsername(identificador, identificador);
    if (vet && Number(vet.activo) !== 0) {
      usuario = {
        id: vet.id,
        nombre: vet.nombre,
        email: vet.email,
        correo: vet.email,
        usuario: vet.usuario,
        contraseña: vet.contraseña,
        idRol: 3 // Rol Veterinario por defecto
      };
    }
  }

  if (!usuario) return null;

  // Validación de estado activo
  if (usuario.activo !== undefined && (Number(usuario.activo) === 0 || usuario.activo === false)) {
    const error = new Error('Acceso denegado: El usuario se encuentra inactivo en el sistema. Contacte al administrador.');
    error.statusCode = 403;
    throw error;
  }

  const contrasenaBD = usuario.contraseña || usuario.password;

  let passwordMatch = false;
  if (contrasenaBD && (contrasenaBD.startsWith('$2a$') || contrasenaBD.startsWith('$2b$'))) {
    passwordMatch = await bcrypt.compare(contraseña, contrasenaBD);
  } else {
    // Seguridad: Rechazar contraseñas en texto plano
    passwordMatch = false;
  }

  if (!passwordMatch) return null;

  const idRolCalculado = usuario.idRol || 2;

  // Generación de Token JWT para control de sesión y RBAC
  const tokenPayload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.correo || usuario.email,
    idRol: idRolCalculado,
    rolNombre: ROLES[idRolCalculado] || 'Empleado'
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

  const { contraseña: _, password: __, ...userClean } = usuario;

  return {
    ...userClean,
    idRol: idRolCalculado,
    rolNombre: ROLES[idRolCalculado] || 'Empleado',
    token
  };
}

/**
 * Obtener todos los usuarios del sistema
 */
async function getAllUsers() {
  return await usersRepository.getAllUsers();
}

/**
 * 🔵 Lógica para: CONSULTAR USUARIO
 */
async function getUserById(id) {
  return await usersRepository.getUserById(id);
}

/**
 * 🔵 Lógica para: ACTUALIZAR USUARIO
 */
async function updateUser(id, datosActualizados) {
  if (datosActualizados.contraseña && !datosActualizados.contraseña.startsWith('$2a$') && !datosActualizados.contraseña.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    datosActualizados.contraseña = await bcrypt.hash(datosActualizados.contraseña, salt);
  }

  const usuarioActualizado = await usersRepository.updateUser(id, datosActualizados);

  if (usuarioActualizado && Number(usuarioActualizado.idRol) === 3) {
    try {
      const usuarioDefecto = (usuarioActualizado.correo || '').split('@')[0];
      const vetExistente = await veterinariosRepository.findByEmailOrUsername(usuarioActualizado.correo, usuarioDefecto);
      if (!vetExistente) {
        await veterinariosRepository.createVeterinario({
          nombre: usuarioActualizado.nombre,
          email: usuarioActualizado.correo,
          usuario: usuarioDefecto,
          contraseña: usuarioActualizado.contraseña,
          fecha_registro: new Date().toISOString().slice(0, 10),
          activo: 1
        });
      }
    } catch (e) {
      console.warn('⚠️ Sincronización secundaria a tabla veterinarios omitida:', e.message);
    }
  }

  return usuarioActualizado;
}

/**
 * Aplicar cambios parciales a un usuario
 */
async function patchUser(id, camposCambiados) {
  return await usersRepository.patchUser(id, camposCambiados);
}

/**
 * 🔴 Lógica para: BORRAR USUARIO
 * Eliminar de forma definitiva a un usuario del sistema
 */
async function deleteUser(id) {
  return await usersRepository.deleteUser(id);
}

// Exportación única de todas las funciones del servicio
module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser
};
