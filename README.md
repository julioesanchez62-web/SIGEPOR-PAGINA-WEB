# SIGEPOR Backend

Este proyecto está configurado para seguir una arquitectura modular con Node.js en CommonJS, Express y MySQL usando mysql2/promise.

## Reglas del proyecto
- Node.js con CommonJS.
- Express como servidor web.
- MySQL con mysql2/promise.
- Módulos por funcionalidad.
- Separación en Route, Validator, Controller, Service y Repository.
- Sin lógica de negocio en el Controller.
- Sin SQL en el Service.
- Contraseñas cifradas antes de almacenarse.
- Sin credenciales reales en el código.
- Cambios pequeños y verificables.

## Estructura base
```text
src/
  app.js
  server.js
  config/
    database.js
    env.js
  routes/
    index.js
  modules/
    users/
      user.routes.js
      user.validator.js
      user.controller.js
      user.service.js
      user.repository.js
```

## Variables de entorno
Copia `.env.example` a `.env` y completa los valores requeridos. Nunca guardes credenciales reales en el repositorio.

## Comandos
```bash
npm install
npm run dev
npm test
```
