require('dotenv').config();

const app = require('./app');
const { port } = require('./config/env');
const { connectMySQL } = require('./config/mysql');

/**
 * Iniciar servidor con validación de MySQL (Fail Fast)
 */
async function startServer() {
  try {
    console.log('🔄 Connecting to MySQL...');
    await connectMySQL();

    app.listen(port, () => {
      console.log(`🚀 SIGEPOR backend running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
