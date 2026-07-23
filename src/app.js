// Importa el framework Express para crear la aplicación web del backend.
const express = require("express");
// Importa el router de usuarios para registrar sus rutas dentro de la aplicación.
const usersRouter = require("./modules/users");
// Importa el middleware global que centraliza el manejo de errores.
const { errorHandler } = require("./middlewares/error.middleware");

// Crea la instancia principal de la aplicación Express.
const app = express();

// Activa el parseo automático de JSON en las solicitudes entrantes.
app.use(express.json());

// Define una ruta raíz de salud para comprobar que la API está activa.
app.get("/", (req, res) => {
  // Responde con un estado 200 y un mensaje indicando que la API está funcionando.
  res.status(200).json({
    message: "SICE API is running",
  });
});

// Registra todas las rutas del módulo de usuarios bajo el prefijo /api/users.
app.use("/api/users", usersRouter);

// Registra el middleware de manejo de errores para capturar excepciones del flujo.
app.use(errorHandler);

// Exporta la aplicación para que pueda ser iniciada desde el servidor principal.
module.exports = app;
