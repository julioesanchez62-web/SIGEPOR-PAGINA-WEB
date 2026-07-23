// Carga las variables de entorno desde el archivo .env para configurar la aplicación.
require("dotenv").config();

// Lista de variables obligatorias que debe definir el entorno para conectar la API.
const requiredEnvironmentVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

// Busca si faltan variables de entorno y guarda el nombre de las que no están definidas.
const missingVariables = requiredEnvironmentVariables.filter(
  (variableName) => !process.env[variableName],
);

// Si faltan variables obligatorias, muestra un error y finaliza la ejecución.
if (missingVariables.length > 0) {
  console.error(
    `Missing environment variables: ${missingVariables.join(", ")}`,
  );

  process.exit(1);
}

// Importa la aplicación Express configurada en app.js.
const app = require("./app");
// Importa la función para conectarse a MySQL.
const { connectMySQL } = require("./config/mysql");

// Define el puerto en el que la API escuchará, usando el valor del entorno o 3000 por defecto.
const PORT = process.env.PORT || 3000;

// Función asíncrona que inicia el servidor y valida la conexión con la base de datos.
async function startServer() {
  try {
    // Establece la conexión con MySQL antes de poner la API en ejecución.
    await connectMySQL();

    // Inicia el servidor HTTP y muestra la URL de acceso.
    app.listen(PORT, () => {
      console.log(`SICE server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Si la conexión o el arranque falla, muestra el error y termina el proceso.
    console.error("Unable to start SICE server");
    console.error(error.message);
    process.exit(1);
  }
}

// Ejecuta la función de arranque del servidor al cargar el archivo.
startServer();
