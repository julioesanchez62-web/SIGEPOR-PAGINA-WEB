require('dotenv').config();

const app = require('./app');
const { port } = require('./config/env');
const { connectMySQL } = require('./config/mysql');

/**
 * Iniciar servidor con validación de MySQL (Fail Fast)
 * 
 * 1. Valida que MySQL esté disponible
 * 2. Si falla, detiene el proceso (no inicia sin BD)
 * 3. Si éxito, inicia Express normalmente
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

