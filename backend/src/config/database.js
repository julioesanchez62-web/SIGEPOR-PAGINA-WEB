const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '12345',
      database: process.env.DB_NAME || 'sigepor',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
}

async function query(sql, params = []) {
  const connection = await getPool().getConnection();

  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    throw new Error(`Error de base de datos: ${error.message}`);
  } finally {
    connection.release();
  }
}

module.exports = {
  getPool,
  query
};
