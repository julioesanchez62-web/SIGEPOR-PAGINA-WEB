const path = require("path");

const dotenv = require("dotenv");


//carga variables de entorno desde archivo .env.test
dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
  override: true,
});

//verificar que el entorno de prueba este configurado correctamente 
if (process.env.NODE_ENV !== "test") {
  throw new Error("Test environment is required");
}