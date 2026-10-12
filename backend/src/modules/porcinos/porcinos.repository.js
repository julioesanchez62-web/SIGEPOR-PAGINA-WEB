/**
 * Repository del módulo de porcinos
 *
 * RESPONSABILIDAD:
 * - Interactuar directamente con la base de datos MySQL (tabla 'porcinos')
 * - Ejecutar consultas SQL (SELECT, INSERT, UPDATE, DELETE)
 */

const { pool } = require('../../config/mysql');

/**
 * Obtener todos los porcinos registrados con nombre de veterinario asignado
 */
async function getAllPorcinos() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.id, 
        p.identificacion, 
        p.raza, 
        p.peso, 
        p.estado_salud, 
        DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento, 
        p.genero, 
        p.veterinario_id, 
        DATE_FORMAT(p.fecha_registro, '%Y-%m-%d %H:%i:%s') AS fecha_registro,
        v.nombre AS veterinario_nombre
      FROM porcinos p
      LEFT JOIN veterinarios v ON p.veterinario_id = v.id
      ORDER BY p.id DESC
    `);
    return rows;
  } catch (error) {
    console.error('❌ Error en getAllPorcinos:', error.message);
    throw error;
  }
}

/**
 * Obtener un porcino por su ID o Identificación
 */
async function getPorcinoByIdOrIdentificacion(identificador) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.id, 
        p.identificacion, 
        p.raza, 
        p.peso, 
        p.estado_salud, 
        DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento, 
        p.genero, 
        p.veterinario_id, 
        DATE_FORMAT(p.fecha_registro, '%Y-%m-%d %H:%i:%s') AS fecha_registro,
        v.nombre AS veterinario_nombre
      FROM porcinos p
      LEFT JOIN veterinarios v ON p.veterinario_id = v.id
      WHERE p.id = ? OR p.identificacion = ?
      LIMIT 1
    `, [identificador, identificador]);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error en getPorcinoByIdOrIdentificacion:', error.message);
    throw error;
  }
}

/**
 * Crear un nuevo porcino
 */
async function createPorcino(datos) {
  try {
    const { veterinario_id, identificacion, raza, peso, estado_salud, fecha_nacimiento, genero } = datos;
    const fecha_registro = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [resultado] = await pool.execute(`
      INSERT INTO porcinos 
      (veterinario_id, identificacion, raza, peso, estado_salud, fecha_nacimiento, genero, fecha_registro) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      veterinario_id ? Number(veterinario_id) : null,
      identificacion,
      raza,
      parseFloat(peso),
      estado_salud,
      fecha_nacimiento,
      genero,
      fecha_registro
    ]);

    return await getPorcinoByIdOrIdentificacion(resultado.insertId);
  } catch (error) {
    console.error('❌ Error en createPorcino:', error.message);
    throw error;
  }
}

/**
 * Actualizar datos de un porcino
 */
async function updatePorcino(id, datos) {
  try {
    const { veterinario_id, identificacion, raza, peso, estado_salud, fecha_nacimiento, genero } = datos;

    await pool.execute(`
      UPDATE porcinos 
      SET 
        veterinario_id = ?, 
        identificacion = ?, 
        raza = ?, 
        peso = ?, 
        estado_salud = ?, 
        fecha_nacimiento = ?, 
        genero = ?
      WHERE id = ? OR identificacion = ?
    `, [
      veterinario_id ? Number(veterinario_id) : null,
      identificacion,
      raza,
      parseFloat(peso),
      estado_salud,
      fecha_nacimiento,
      genero,
      id,
      id
    ]);

    return await getPorcinoByIdOrIdentificacion(id);
  } catch (error) {
    console.error('❌ Error en updatePorcino:', error.message);
    throw error;
  }
}

/**
 * Eliminar un porcino por ID o Identificación
 */
async function deletePorcino(id) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM porcinos WHERE id = ? OR identificacion = ?',
      [id, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('❌ Error en deletePorcino:', error.message);
    throw error;
  }
}

/**
 * Obtener lista de veterinarios activos para el formulario
 */
async function getVeterinarios() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, activo FROM veterinarios ORDER BY nombre ASC'
    );
    return rows;
  } catch (error) {
    console.error('❌ Error en getVeterinarios:', error.message);
    throw error;
  }
}

module.exports = {
  getAllPorcinos,
  getPorcinoByIdOrIdentificacion,
  createPorcino,
  updatePorcino,
  deletePorcino,
  getVeterinarios
};
