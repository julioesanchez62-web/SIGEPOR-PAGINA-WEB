const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config(); // Fallback si está en el root

// Se remueve DB_PASSWORD de las variables estrictamente obligatorias
const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
const missing = requiredEnv.filter((key) => {
  const value = process.env[key];
  return value === undefined || value === null || value === '';
});

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
}

module.exports = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '', // Si no existe o es vacía, envía ""
    database: process.env.DB_NAME
  }
};