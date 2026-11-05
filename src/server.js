const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const app = require('./app');
const { port } = require('./config/env');
const { connectMySQL } = require('./config/mysql');

/**
 * Iniciar servidor con validación de MySQL (Fail Fast)
 * Escucha obligatoriamente en 0.0.0.0 para que el proxy público de Railway enrute el tráfico.
 */
async function startServer() {
  try {
    console.log('🔄 Connecting to MySQL...');
    await connectMySQL();

    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 SIGEPOR backend running on port ${port} (host: 0.0.0.0)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
