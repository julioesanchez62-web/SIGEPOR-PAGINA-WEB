/**
 * Repository del módulo de veterinarios
 *
 * RESPONSABILIDAD:
 * - Interactuar directamente con la base de datos MySQL (tabla 'veterinarios')
 * - Ejecutar consultas SQL (SELECT, INSERT, UPDATE, DELETE)
 * - Retornar datos o null si no existe el registro
 */

const { pool } = require('../../config/mysql');

/**
 * Obtener todos los veterinarios registrados
 */
async function getAllVeterinarios() {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, usuario, DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha_registro, activo 
       FROM veterinarios 
       ORDER BY id ASC`
    );
    return rows;
  } catch (error) {
    console.error('❌ Error en getAllVeterinarios:', error.message);
    throw error;
  }
}

/**
 * Obtener veterinario por su ID
 */
async function getVeterinarioById(id) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, usuario, DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha_registro, activo 
       FROM veterinarios 
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error en getVeterinarioById:', error.message);
    throw error;
  }
}

/**
 * Buscar veterinario por email o nombre de usuario
 */
async function findByEmailOrUsername(email, usuario) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, usuario, contraseña, DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha_registro, activo 
       FROM veterinarios 
       WHERE (LOWER(TRIM(email)) = LOWER(TRIM(?)) AND ? != '')
          OR (LOWER(TRIM(usuario)) = LOWER(TRIM(?)) AND ? != '')
       LIMIT 1`,
      [email || '', email || '', usuario || '', usuario || '']
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error en findByEmailOrUsername:', error.message);
    throw error;
  }
}

/**
 * Crear un nuevo veterinario
 */
async function createVeterinario(datos) {
  try {
    const { id, nombre, email, usuario, contraseña, fecha_registro, activo } = datos;
    const estadoActivo = activo !== undefined && activo !== null ? Number(activo) : 1;
    const fecha = fecha_registro || new Date().toISOString().slice(0, 10);

    let result;
    if (id && Number(id) > 0) {
      // Inserción con ID manual
      const [res] = await pool.execute(
        `INSERT INTO veterinarios (id, nombre, email, usuario, contraseña, fecha_registro, activo) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [Number(id), nombre, email, usuario, contraseña, fecha, estadoActivo]
      );
      result = res;
      return await getVeterinarioById(Number(id));
    } else {
      // Inserción con AUTO_INCREMENT
      const [res] = await pool.execute(
        `INSERT INTO veterinarios (nombre, email, usuario, contraseña, fecha_registro, activo) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, email, usuario, contraseña, fecha, estadoActivo]
      );
      result = res;
      return await getVeterinarioById(result.insertId);
    }
  } catch (error) {
    console.error('❌ Error en createVeterinario:', error.message);
    throw error;
  }
}

/**
 * Actualizar datos de un veterinario existente
 */
async function updateVeterinario(id, datos) {
  try {
    const { nombre, email, usuario, contraseña, fecha_registro, activo } = datos;
    const estadoActivo = activo !== undefined && activo !== null ? Number(activo) : 1;
    const fecha = fecha_registro || new Date().toISOString().slice(0, 10);

    if (contraseña && contraseña.trim() !== '') {
      await pool.execute(
        `UPDATE veterinarios 
         SET nombre = ?, email = ?, usuario = ?, contraseña = ?, fecha_registro = ?, activo = ? 
         WHERE id = ?`,
        [nombre, email, usuario, contraseña, fecha, estadoActivo, id]
      );
    } else {
      await pool.execute(
        `UPDATE veterinarios 
         SET nombre = ?, email = ?, usuario = ?, fecha_registro = ?, activo = ? 
         WHERE id = ?`,
        [nombre, email, usuario, fecha, estadoActivo, id]
      );
    }

    return await getVeterinarioById(id);
  } catch (error) {
    console.error('❌ Error en updateVeterinario:', error.message);
    throw error;
  }
}

/**
 * Eliminar un veterinario por su ID
 */
async function deleteVeterinario(id) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM veterinarios WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('❌ Error en deleteVeterinario:', error.message);
    throw error;
  }
}

module.exports = {
  getAllVeterinarios,
  getVeterinarioById,
  findByEmailOrUsername,
  createVeterinario,
  updateVeterinario,
  deleteVeterinario
};
