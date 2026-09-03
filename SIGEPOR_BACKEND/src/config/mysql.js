/**
 * Configuración de MySQL con Pool de Conexiones
 * 
 * ¿Por qué usamos un pool?
 * - Reutiliza conexiones en lugar de crear nuevas (mejor rendimiento)
 * - Maneja múltiples consultas concurrentes
 * - Reduce latencia de handshake con la BD
 * 
 * ¿Por qué mysql2/promise?
 * - Promesas nativas (async/await limpio)
 * - Driver rápido en C++
 * - Manejo de errores con try-catch
 * - Pool integrado y fácil de usar
 */

const mysql = require('mysql2/promise');
const { db } = require('./env');

/**
 * Crear pool de conexiones a MySQL
 * 
 * Parámetros clave:
 * - waitForConnections: espera si no hay conexiones disponibles
 * - connectionLimit: máximo de conexiones simultáneas en el pool (10 es seguro)
 * - queueLimit: 0 = sin límite de espera en cola
 */
const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Conectar y validar MySQL (Fail Fast)
 * 
 * Se ejecuta en server.js ANTES de iniciar Express.
 * Si falla, detiene el proceso (no inicia servidor sin BD disponible).
 * 
 * Realiza un SELECT 1 como health check.
 */
async function connectMySQL() {
  try {
    const [rows] = await pool.execute('SELECT 1 AS ok');

    if (!rows || rows.length === 0 || rows[0].ok !== 1) {
      throw new Error('MySQL health check failed');
    }

    console.log('✓ MySQL connected successfully');
    return true;
  } catch (error) {
    console.error('✗ MySQL connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  connectMySQL
};
