// Importa la conexión a la base de datos MySQL desde la configuración centralizada.
const { pool } = require("../../config/mysql");

/* POST - CREAR USUARIO */

// Define una función asincrónica llamada create que recibe los datos del usuario a registrar.
async function create(userData) {
  // Desestructura los campos necesarios del objeto userData para trabajar con ellos directamente.
  const { nombre, correo, contrasena, idRol } = userData;

  // Construye la consulta SQL para insertar un nuevo usuario en la tabla usuario.
  const query = `
    INSERT INTO usuario (
      nombre,
      correo,
      contrasena,
      id_rol_fk
    )
    VALUES (?, ?, ?, ?)
  `;

  // Prepara los valores que se enviarán a la consulta SQL en el orden correspondiente.
  const values = [nombre, correo, contrasena, idRol];

  // Ejecuta la consulta INSERT en la base de datos con los valores proporcionados.
  const [result] = await pool.execute(query, values);

  // Devuelve un objeto con la información básica del usuario recién creado.
  return {
    // Asigna el identificador generado por la base de datos al campo idUsuario.
    idUsuario: result.insertId,
    // Devuelve el nombre del usuario registrado.
    nombre,
    // Devuelve el correo del usuario registrado.
    correo,
    // Devuelve el identificador del rol asignado al usuario.
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
    ORDER BY u.id_usuario DESC
  `);

  return rows;
}

/* GET - CONSULTAR USUARIO POR ID */
async function findById(idUsuario) {
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
    `,
    [idUsuario],
  );

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

/* PUT - ACTUALIZAR USUARIO */
async function update(idUsuario, userData) {
  const { nombre, correo, estado, idRol } = userData;

  await pool.execute(
    `
      UPDATE usuario
      SET
        nombre = ?,
        correo = ?,
        estado = ?,
        id_rol_fk = ?
      WHERE id_usuario = ?
    `,
    [nombre, correo, estado, idRol, idUsuario],
  );

  return findById(idUsuario);
}

/* delete - DESACTIVAR USUARIO */
async function deactivate(idUsuario) {
  await pool.execute(
    `
      UPDATE usuario
      SET estado = 0
      WHERE id_usuario = ?
    `,
    [idUsuario],
  );

  return findById(idUsuario);
}

// Exporta la función create para que pueda ser reutilizada desde otros módulos.
module.exports = {
  // Expone la función create dentro del módulo exportado.
  create,
  findByEmail,
  findRoleById,
  findAll,
  findById,
  findByEmailExcludingId,
  update,
  deactivate,
};
