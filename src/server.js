require("dotenv").config();

const requiredEnvironmentVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

const missingVariables = requiredEnvironmentVariables.filter(
  (variableName) => !process.env[variableName],
);

if (missingVariables.length > 0) {
  console.error(
    `Missing environment variables: ${missingVariables.join(", ")}`,
  );

  process.exit(1);
}

const app = require("./app");
const { connectMySQL } = require("./config/mysql");

const PORT = process.env.PORT || 3000;

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
/**
 * 
 * 
 * server.js
├── carga variables de entorno
├── importa la aplicación
├── define el puerto
└── inicia el servidor
 */
