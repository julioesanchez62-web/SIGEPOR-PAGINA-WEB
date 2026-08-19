const { pool } = require("../../config/mysql");

/**
 * Busca un usuario por correo para el proceso de autenticación.
 *
 * Incluye la contraseña cifrada porque será utilizada
 * posteriormente por el Service con bcrypt.compare().
 */

async function findByEmail(correo) {
  const [rows] = await pool.execute(
    `
      SELECT
        u.id_usuario AS idUsuario,
        u.nombre,
        u.correo,
        u.contrasena,
        u.estado,
        u.id_rol_fk AS idRol,
        r.nombre AS rol
      FROM usuario AS u
      INNER JOIN rol AS r
        ON u.id_rol_fk = r.id_rol
      WHERE u.correo = ?
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [correo],
  );

  return rows[0] || null;
}

module.exports = {
  findByEmail,
};
