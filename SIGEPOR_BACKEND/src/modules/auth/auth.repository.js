const { pool } = require('../../config/mysql');

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, contraseña, activo FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

module.exports = {
  findUserByEmail
};