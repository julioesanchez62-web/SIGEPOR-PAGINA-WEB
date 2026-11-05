const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const app = require('./app');
const { port } = require('./config/env');
const { connectMySQL } = require('./config/mysql');

/**
 * Iniciar servidor con validación de MySQL (Fail Fast)
 * Se vincula a 0.0.0.0 para compatibilidad con Railway, Render y Docker
 */
async function startServer() {
  try {
    console.log('🔄 Connecting to MySQL...');
    await connectMySQL();

    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 SIGEPOR backend running on port ${port} (0.0.0.0)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
