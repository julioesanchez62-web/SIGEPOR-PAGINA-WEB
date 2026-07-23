// Importa la librería mysql2 con soporte para promesas para manejar conexiones asíncronas.
const mysql = require("mysql2/promise");

// Crea un pool de conexiones reutilizables para manejar varias consultas concurrentes.
const pool = mysql.createPool({
  // Host del servidor MySQL definido en las variables de entorno.
  host: process.env.DB_HOST,
  // Puerto del servidor MySQL con valor por defecto 3306.
  port: Number(process.env.DB_PORT) || 3306,
  // Usuario de la base de datos.
  user: process.env.DB_USER,
  // Contraseña del usuario de MySQL.
  password: process.env.DB_PASSWORD,
  // Nombre de la base de datos a utilizar.
  database: process.env.DB_NAME,
  // Espera conexiones disponibles cuando el pool está saturado.
  waitForConnections: true,
  // Número máximo de conexiones simultáneas permitidas.
  connectionLimit: 10,
  // Sin límite de cola de espera.
  queueLimit: 0,
});

// Función que valida la conexión a la base de datos ejecutando una consulta simple.
async function connectMySQL() {
  // Obtiene una conexión disponible del pool.
  const connection = await pool.getConnection();

  try {
    // Ejecuta una consulta de prueba para confirmar que la conexión funciona.
    await connection.query("SELECT 1");
    // Muestra un mensaje de confirmación en consola si la conexión fue exitosa.
    console.log("MySQL connection established");
  } finally {
    // Libera la conexión al pool para reutilizarla después de la prueba.
    connection.release();
  }
}

// Exporta el pool y la función de conexión para usarla en otras partes de la aplicación.
module.exports = {
  pool,
  connectMySQL,
};
