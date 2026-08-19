// Carga las variables de entorno desde el archivo .env.
require("dotenv").config();

// Lista de variables obligatorias para ejecutar la aplicación.
const requiredEnvironmentVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
];

// Identifica las variables de entorno que no están definidas.
const missingVariables = requiredEnvironmentVariables.filter(
  (variableName) => !process.env[variableName],
);

// Finaliza la ejecución si falta alguna variable obligatoria.
if (missingVariables.length > 0) {
  console.error(
    `Missing environment variables: ${missingVariables.join(", ")}`,
  );

  process.exit(1);
}

// Importa la aplicación Express configurada.
const app = require("./app");

// Importa la función para comprobar la conexión con MySQL.
const { connectMySQL } = require("./config/mysql");

// Define el puerto de ejecución.
const PORT = process.env.PORT || 3000;

/**
 * Inicia la conexión con MySQL y posteriormente
 * pone en funcionamiento el servidor HTTP.
 */
async function startServer() {
  try {
    await connectMySQL();

    app.listen(PORT, () => {
      console.log(`SICE server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start SICE server");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
