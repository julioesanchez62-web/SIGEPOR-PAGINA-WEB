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
  let connection;

  try {
    connection = await getPool().getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    throw new Error(`Error de base de datos [${error.code || 'UNKNOWN'}]: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function checkDatabaseConnection() {
  let connection;

  try {
    connection = await getPool().getConnection();
    await connection.ping();
  } catch (error) {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = Number(process.env.DB_PORT) || 3306;
    const database = process.env.DB_NAME || 'sigepor';
    const user = process.env.DB_USER || 'root';
    const code = error.code || 'UNKNOWN';

    throw new Error(
      `No se pudo conectar a MySQL (${code}): ${error.message}. ` +
      `Configuración actual -> host: ${host}, puerto: ${port}, base de datos: ${database}, usuario: ${user}.`
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  getPool,
  query,
  checkDatabaseConnection
};
