const path = require('path');
// Cargar variables de entorno desde .env local o desde el directorio raíz
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

/**
 * Normalización de variables de base de datos
 * Admite tanto variables personalizadas (DB_HOST) como las inyectadas nativamente por Railway (MYSQLHOST)
 */
const dbHost = process.env.DB_HOST || process.env.MYSQLHOST;
const dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
const dbUser = process.env.DB_USER || process.env.MYSQLUSER;
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || '');
const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE;
const jwtSecret = process.env.JWT_SECRET;

// Validación estricta con diagnóstico claro de qué variable falta
const missing = [];
if (!dbHost) missing.push('DB_HOST (o MYSQLHOST)');
if (!dbUser) missing.push('DB_USER (o MYSQLUSER)');
if (!dbName) missing.push('DB_NAME (o MYSQLDATABASE)');
if (!jwtSecret) missing.push('JWT_SECRET');

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno obligatorias en el servidor: ${missing.join(', ')}`);
}

module.exports = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: jwtSecret,
  sessionSecret: process.env.SESSION_SECRET || jwtSecret || 'sigepor_session_secret_2026',
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
  db: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName
  }
};
