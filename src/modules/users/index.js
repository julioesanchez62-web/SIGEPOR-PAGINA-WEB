/**
 * Módulo de rutas de usuarios.
 *
 * Este archivo actúa como punto de entrada para las rutas
 * del recurso `users`. Exporta el router específico del módulo
 * para que la aplicación principal lo pueda montar en la ruta base.
 */
const usersRouter = require("./users.routes");

// Exporta el router de usuarios para su uso en `app.js` o `server.js`.
module.exports = usersRouter;
