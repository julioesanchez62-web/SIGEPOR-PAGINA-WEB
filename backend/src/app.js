const cors = require('cors');
const express = require('express');
const indexRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

/**
 * ORDEN CORRECTO DE MIDDLEWARES EN EXPRESS
 * 
 * 1️⃣ Middlewares globales (body parser, etc.)
 * 2️⃣ Rutas
 * 3️⃣ Capturador de 404 (rutas no encontradas)
 * 4️⃣ Middleware de errores (SIEMPRE al final)
 * 
 * ⚠️ El middleware de errores DEBE estar último porque Express
 * busca middlewares de arriba a abajo y si está antes de las rutas,
 * nunca las rutas lo verán.
 */

// 1. Middlewares globales
app.use(cors()); // <--- 🔥 ¡ESTA LÍNEA ES LA QUE ACTIVA EL PERMISO PARA EL NAVEGADOR!
app.use(express.json());

// 2. Rutas principales
app.use('/', indexRoutes);

// 3. Capturador de 404
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.statusCode = 404;
  next(error);
});

// 4. Middleware de errores (SIEMPRE ÚLTIMO)
app.use(errorMiddleware);

module.exports = app;
