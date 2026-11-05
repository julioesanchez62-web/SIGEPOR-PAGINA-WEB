const { pool } = require('../../config/mysql');

async function findUserByEmail(identificador) {
  const [rows] = await pool.execute(
    'SELECT id_usuario, id_usuario AS id, nombre, email, usuario, contraseña, idRol, activo FROM usuarios WHERE email = ? OR usuario = ? LIMIT 1',
    [identificador, identificador]
  );
  return rows[0] || null;
}

module.exports = {
  findUserByEmail
};