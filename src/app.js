// Importa Express para crear la aplicación.
const express = require("express");

// Importa el router del módulo de usuarios.
const usersRouter = require("./modules/users");

// Importa el router del módulo de autenticación.
const authRouter = require("./modules/auth/auth.routes");

// Importa el middleware global de errores.
const { errorHandler } = require("./middlewares/error.middleware");

// Crea la aplicación principal de Express.
const app = express();

// Permite que Express interprete cuerpos enviados en formato JSON.
app.use(express.json());

// Ruta de salud para comprobar que la API está funcionando.
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "SICE API is running",
  });
});

// Registra las rutas del módulo de usuarios.
app.use("/api/users", usersRouter);

// Registra las rutas del módulo de autenticación.
app.use("/api/auth", authRouter);

// Registra el middleware global de errores.
// Debe permanecer después de todas las rutas.
app.use(errorHandler);

// Exporta la aplicación para que server.js pueda iniciarla.
module.exports = app;
