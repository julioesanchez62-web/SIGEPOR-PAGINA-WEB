const express = require('express');
const app = express();
const db = require('./config/mysql'); // Importamos el pool de la base de datos
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Middleware para entender JSON
app.use(express.json());

// Función para verificar la conexión a Clever Cloud antes de levantar el servidor
async function startServer() {
  try {
    console.log('🔄 Conectando a MySQL en Clever Cloud...');
    
    // Hacemos una consulta de prueba rápida para validar las credenciales del .env
    await db.query('SELECT 1');
    console.log('✅ Conexión exitosa a la base de datos en la nube.');

    // Si la base de datos responde, levantamos el servidor express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error crítico al conectar a la base de datos:');
    console.error(error.message);
    process.exit(1); // Detiene la aplicación si las credenciales están mal
  }
}

// Iniciar el flujo
startServer();
