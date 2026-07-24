/**
 * Repositorio de usuarios.
 *
 * Encapsula las consultas y operaciones SQL de la tabla `usuario`
 * y permite que el servicio acceda a los datos sin manejar la lógica de negocio.
 */
const { pool } = require("../../config/mysql");

/**
 * Inserta un nuevo usuario en la base de datos.
 *
 * @param {Object} userData
 * @returns {Object} Usuario creado con su id generado.
 */
async function create(userData) {
  const { nombre, correo, contrasena, idRol } = userData;

  const query = `
    INSERT INTO usuario (
      nombre,
      correo,
      contrasena,
      id_rol_fk
    )
    VALUES (?, ?, ?, ?)
  `;

  const values = [nombre, correo, contrasena, idRol];
  const [result] = await pool.execute(query, values);

  return {
    idUsuario: result.insertId,
    nombre,
    correo,
    idRol,
  };
}

//Agregar búsqueda por correo
async function findByEmail(correo) {
  const query = `
    SELECT
      id_usuario,
      nombre,
      correo,
      estado,
      id_rol_fk
    FROM usuario
    WHERE correo = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [correo]);

  return rows[0] || null;
}

async function findRoleById(idRol) {
  const query = `
    SELECT
      id_rol,
      nombre
    FROM rol
    WHERE id_rol = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [idRol]);

  return rows[0] || null;
}

/**
 * CONSULTAR USUARIO
 *
 */

async function findAll() {
  const [rows] = await pool.execute(`
    SELECT
      u.id_usuario AS idUsuario,
      u.nombre,
      u.correo,
      u.estado,
      u.id_rol_fk AS idRol,
      r.nombre AS rol,
      r.descripcion AS descripcionRol
    FROM usuario AS u
    INNER JOIN rol AS r
      ON u.id_rol_fk = r.id_rol
    WHERE u.deleted_at IS NULL
    ORDER BY u.id_usuario DESC
  `);

  return rows;
}

/* GET - CONSULTAR USUARIO POR ID */
async function findById(idUsuario) {
  console.log("idUsuario:", idUsuario);
  console.log("Tipo:", typeof idUsuario);
  const [rows] = await pool.execute(
    `
        SELECT
          u.id_usuario AS idUsuario,
          u.nombre,
          u.correo,
          u.estado,
          u.id_rol_fk AS idRol,
          r.nombre AS rol,
          r.descripcion AS descripcionRol
        FROM usuario AS u
        INNER JOIN rol AS r
          ON u.id_rol_fk = r.id_rol
        WHERE u.id_usuario = ?
        AND u.deleted_at IS NULL
    `,
    [idUsuario],
  );
  console.log(rows);
  return rows[0] || null;
}

/*  PUT - CONSULTAR USUARIO POR CORREO EXCLUYENDO ID */
async function findByEmailExcludingId(correo, idUsuario) {
  const [rows] = await pool.execute(
    `
      SELECT
        id_usuario AS idUsuario,
        nombre,
        correo,
        estado,
        id_rol_fk AS idRol
      FROM usuario
      WHERE correo = ?
        AND id_usuario <> ?  /* Excluye el usuario con el ID proporcionado para evitar conflictos al actualizar */
      LIMIT 1
    `,
    [correo, idUsuario],
  );

  return rows[0] || null;
}

/* PUT - UPDATE USER */
async function update(idUsuario, userData) {
  const { nombre, correo, idRol } = userData;

  await pool.execute(
    `
      UPDATE usuario
      SET
        nombre = ?,
        correo = ?,
        id_rol_fk = ?
      WHERE id_usuario = ?
        AND deleted_at IS NULL
    `,
    [nombre, correo, idRol, idUsuario],
  );

  return findById(idUsuario);
}

/* DELETE - SOFT DELETE USER */
async function softDelete(idUsuario) {
  const [result] = await pool.execute(
    `
      UPDATE usuario
      SET
        estado = 0,
        deleted_at = NOW()
      WHERE id_usuario = ?
        AND deleted_at IS NULL
    `,
    [idUsuario],
  );

  return result;
}

/**
 * Actualiza únicamente el estado de un usuario sin modificar otros campos.
 *
 * @param {number} idUsuario
 * @param {number} estado
 * @returns {Object|null}
 */
async function updateStatus(idUsuario, estado) {
  await pool.execute(
    `
      UPDATE usuario
      SET estado = ?
      WHERE id_usuario = ?
        AND deleted_at IS NULL
    `,
    [estado, idUsuario],
  );

  return findById(idUsuario);
}

// Exporta las funciones disponibles del repositorio de usuarios.
module.exports = {
  create,
  findByEmail,
  findRoleById,
  findAll,
  findById,
  findByEmailExcludingId,
  update,
  softDelete,
  updateStatus,
};
