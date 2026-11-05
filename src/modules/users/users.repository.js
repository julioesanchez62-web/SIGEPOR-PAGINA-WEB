/**
 * Repository del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Interactuar directamente con la base de datos (MySQL)
 * - Ejecutar consultas SQL (SELECT, INSERT, UPDATE, DELETE)
 * - Retornar datos planos o null si no existe el registro
 * - Manejar la persistencia de datos
 * 
 * NO HACE:
 * - Validar datos de entrada ❌
 * - Aplicar reglas de negocio ❌
 * - Responder peticiones HTTP ❌
 * - Cifrar contraseñas ❌
 */

const { pool } = require('../../config/mysql');

/**
 * Buscar usuario por correo electrónico o nombre de usuario (para Login)
 */
async function findByEmailOrUsername(identificador) {
  try {
    if (!identificador) return null;

    const [rows] = await pool.execute(
      `SELECT id_usuario, id_usuario AS id, nombre, email AS correo, usuario, contraseña, idRol, telefono, fecha_registro, activo
       FROM usuarios
       WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
         OR LOWER(TRIM(usuario)) = LOWER(TRIM(?))
       LIMIT 1`,
      [identificador, identificador]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error('Error en findByEmailOrUsername:', error.message);
    throw error;
  }
}

/**
 * 🔵 Lógica para el botón: CONSULTAR USUARIO  MEJORADO
 * Buscar usuario por ID
 */
async function getUserById(id) {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id_usuario, u.id_usuario AS id, u.nombre, u.email AS correo, u.usuario, 
              u.idRol, COALESCE(r.nombre_rol, 'Cliente') AS rol_nombre, 
              u.telefono, u.fecha_registro, u.activo 
       FROM usuarios u
       LEFT JOIN roles r ON u.idRol = r.idRol
       WHERE u.id_usuario = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getUserById:', error.message);
    throw error;
  }
}

/**
 * 🟢 Lógica para el botón: GUARDAR CAMBIOS
 * Crear nuevo usuario en la tabla 'usuarios'
 */
async function createUser(datos) {
  try {
    const { nombre, correo, usuario, contraseña, idRol, telefono } = datos;
    // Usamos el usuario provisto o el correo como nombre de usuario por defecto
    const usuarioFinal = usuario || (correo ? correo.split('@')[0] : 'user_' + Date.now()); 

    // 1. Ejecutar la inserción en MySQL con consulta preparada parametrizada (Seguridad anti-SQL Injection)
    // Se asegura la asignación por defecto del rol 4 (Cliente / Mínimos privilegios)
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, usuario, contraseña, idRol, telefono, fecha_registro, activo) VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)',
      [nombre, correo, usuarioFinal, contraseña, idRol || 4, telefono || null]
    );

    // 2. Control de seguridad
    if (!result || !result.insertId) {
      throw new Error('La base de datos no pudo generar un ID válido para el nuevo registro.');
    }

    // 3. Buscar y retornar el usuario recién insertado
    return await getUserById(result.insertId);
  } catch (error) {
    console.error('Error en createUser:', error.message);
    throw error;
  }
}

/**
 * Obtener todos los usuarios del sistema (con nombre de rol para panel administrativo)
 */
async function getAllUsers() {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id_usuario, u.id_usuario AS id, u.nombre, u.email AS correo, u.usuario, 
              u.idRol, COALESCE(r.nombre_rol, 'Cliente') AS rol_nombre, 
              u.telefono, u.fecha_registro, u.activo 
       FROM usuarios u
       LEFT JOIN roles r ON u.idRol = r.idRol
       ORDER BY u.id_usuario DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error en getAllUsers:', error.message);
    throw error;
  }
}

/**
 * 🔵 Lógica para el botón: ACTUALIZAR USUARIO (Maneja PUT completo)
 */
async function updateUser(id, datos) {
  try {
    const { nombre, correo, usuario, contraseña, idRol, telefono } = datos;
    const telefono_db = telefono !== undefined && telefono !== null && String(telefono).trim() !== '' 
      ? String(telefono).trim() 
      : null;

    if (contraseña) {
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, email = ?, contraseña = ?, idRol = ?, telefono = ? WHERE id_usuario = ?',
        [nombre, correo, contraseña, idRol, telefono_db, id]
      );
    } else {
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, email = ?, idRol = ?, telefono = ? WHERE id_usuario = ?',
        [nombre, correo, idRol, telefono_db, id]
      );
    }

    return await getUserById(id);
  } catch (error) {
    console.error('Error en repository.updateUser (PUT):', error.message);
    throw error;
  }
}

/**
 * Lógica para actualización parcial (Maneja PATCH dinámico)
 */
async function patchUser(id, camposCambiados) {
  try {
    const keys = Object.keys(camposCambiados);
    if (keys.length === 0) return await getUserById(id);

    // Construcción dinámica de la consulta SQL para los campos que vengan en el body
    const asignaciones = keys.map(key => `${key} = ?`).join(', ');
    const valores = Object.values(camposCambiados);
    valores.push(id); // Añadimos el id para el WHERE

    const sql = `UPDATE usuarios SET ${asignaciones} WHERE id_usuario = ?`;
    await pool.execute(sql, valores);

    return await getUserById(id);
  } catch (error) {
    console.error('Error en repository.patchUser (PATCH):', error.message);
    throw error;
  }
}

/**
 * 🔴 Lógica para el botón: BORRAR USUARIO
 * Eliminar usuario por ID
 */
async function deleteUser(id) {
  try {
    await pool.execute('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error en deleteUser:', error.message);
    throw error;
  }
}

module.exports = {
  findByEmailOrUsername,
  getUserById,
  createUser,
  getAllUsers,
  updateUser,
  patchUser,
  deleteUser,
  pool
};
