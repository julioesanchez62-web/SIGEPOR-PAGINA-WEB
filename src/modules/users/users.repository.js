// Importa la conexión a la base de datos MySQL desde la configuración centralizada.
const { pool } = require("../../config/mysql");

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

// Exporta la función create para que pueda ser reutilizada desde otros módulos.
module.exports = {
  // Expone la función create dentro del módulo exportado.
  create,
  findByEmail,
  findRoleById,
};
