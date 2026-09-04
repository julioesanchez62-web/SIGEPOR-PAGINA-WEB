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
 * Buscar usuario estrictamente por correo electrónico
 * Corregido: Busca solo en la columna 'email' y remueve espacios en blanco
 */
async function findUserByEmail(correo) {
  try {
    if (!correo) return null;

    const [rows] = await pool.execute(
      'SELECT id, nombre, email AS correo, usuario, contraseña, fecha_registro, activo FROM usuarios WHERE email = ? LIMIT 1',
      [correo.trim()]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error('Error en findUserByEmail:', error.message);
    throw error;
  }
}

/**
 * Buscar usuario por ID
 * Usa 'AS correo' para mapear la columna de la BD a la propiedad esperada
 */
async function findUserById(id) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, email AS correo, usuario, fecha_registro, activo FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error en findUserById:', error.message);
    throw error;
  }
}

/**
 * Validar rol (Simulado / placeholder)
 */
async function findRoleById(idRol) {
  try {
    return { id: idRol, nombre: 'Usuario' };
  } catch (error) {
    console.error('Error en findRoleById:', error.message);
    throw error;
  }
}

/**
 * Crear nuevo usuario en la tabla 'usuarios'
 */
async function createUser(userData) {
  try {
    const { nombre, correo, email, contraseñaHash } = userData;
    const correoFinal = correo || email;

    // 1. Ejecutar la inserción en MySQL
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, usuario, contraseña, fecha_registro, activo) VALUES (?, ?, ?, ?, NOW(), 1)',
      [nombre, correoFinal, correoFinal, contraseñaHash]
    );

    // 2. Control de seguridad: Si no se generó un ID, lanzar error explícito
    if (!result || !result.insertId) {
      throw new Error('La base de datos no pudo generar un ID válido para el nuevo registro.');
    }

    // 3. Buscar y retornar el usuario recién insertado con sus datos limpios
    return await findUserById(result.insertId);
  } catch (error) {
    console.error('Error en createUser:', error.message);
    throw error;
  }
}

/**
 * Obtener todos los usuarios
 */
async function getUsers() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, email AS correo, usuario, fecha_registro, activo FROM usuarios'
    );
    return rows;
  } catch (error) {
    console.error('Error en getUsers:', error.message);
    throw error;
  }
}

/**
 * Actualizar datos de usuario de manera dinámica (Compatible con PUT y PATCH)
 * 🔥 REVISADO Y OPTIMIZADO PARA SOPORTAR AMBOS MÉTODOS SIN DUPLICAR FUNCIONES
 */
async function updateUser(id, datos) {
  try {
    const { nombre, correo, email, activo } = datos;
    const correoFinal = correo || email;

    // 1. Si viene el campo 'activo' (como en tu PATCH {"activo": 0}), actualizamos esa columna
    if (activo !== undefined) {
      await pool.execute(
        'UPDATE usuarios SET activo = ? WHERE id = ?',
        [activo, id]
      );
    } 
    // 2. Si vienen los campos de texto normales (como en tu PUT), ejecutamos la consulta clásica
    else {
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
        [nombre, correoFinal, id]
      );
    }

    // Retornamos el objeto plano actualizado combinado con el ID de la URL
    return {
      id: parseInt(id),
      ...datos
    };
  } catch (error) {
    console.error('Error en repository.updateUser (PATCH/PUT):', error.message);
    throw error;
  }
}

/**
 * Eliminar usuario por ID
 */
async function deleteUser(id) {
  try {
    await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error en deleteUser:', error.message);
    throw error;
  }
}

module.exports = {
  findUserByEmail,
  findUserById,
  findRoleById,
  createUser,
  getUsers,
  updateUser, // <--- Exportación unificada oficial
  deleteUser,
  pool
};
