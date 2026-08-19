require('dotenv').config();

const app = require('./src/app');
const { connectMySQL } = require('./src/config/mysql');

const PORT = Number(process.env.PORT || 3001);

async function startServer() {
  try {
    await connectMySQL();
    app.listen(PORT, () => {
      console.log(`Servidor SIGEPOR escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar con MySQL:', error.message);
    process.exitCode = 1;
  }
}

startServer();

module.exports = app;
