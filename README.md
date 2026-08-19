# SIGEPOR / SICE

Proyecto web con backend SICE en Node.js y Express, frontend React con Vite y persistencia en MySQL.

## Descripción

La solución integra autenticación, gestión de usuarios por roles y una interfaz web protegida. El backend aplica una arquitectura por capas: rutas, controladores, servicios y repositorios.

## Requisitos

- Node.js v18 o superior
- MySQL
- npm

## Instalación

1. Clona el repositorio y entra a la carpeta del proyecto.
2. Crea `.env` a partir de las variables indicadas abajo.
3. Instala las dependencias:

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=sice_db
JWT_SECRET=una_clave_segura
PORT=3001
```

> Nota: `DB_PORT` y `PORT` son opcionales si se usan los valores por defecto 3306 y 3000.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

## Estructura del proyecto

- `src/app.js`: configuración principal de Express y rutas montadas.
- `src/server.js`: arranque del servidor y conexión a MySQL.
- `src/config/mysql.js`: configuración del pool de MySQL y función de conexión.
- `src/modules/users/`: módulo de usuarios con rutas, controlador, servicio, repositorio y validadores.
- `src/modules/auth/`: módulo de autenticación con ruta de ejemplo de login.
- `src/middlewares/error.middleware.js`: middleware global de manejo de errores.
- `src/utils/`: utilidades compartidas.

## Endpoints principales

### Salud

- `GET /` → verifica que la API esté activa.

### Usuarios

- `POST /api/users` → crear un usuario.
- `GET /api/users` → obtener todos los usuarios.
- `GET /api/users/:id` → obtener un usuario por ID.
- `PUT /api/users/:id` → actualizar un usuario.
- `DELETE /api/users/:id` → eliminación lógica de un usuario.

### Autenticación

- `POST /api/auth/login` → autentica un usuario y devuelve un token JWT.
- `GET /api/auth/profile` → consulta el perfil autenticado.

Las rutas protegidas requieren `Authorization: Bearer <token>`.

## Frontend React

```bash
cd sice-frontend
npm install
npm run dev
```

El frontend usa React Router, Axios y Context API. Incluye login, sesión persistente, cierre de sesión, dashboard, perfil y CRUD de usuarios con control de roles.

Comandos disponibles:

- `npm run build` → genera la compilación de producción.
- `npm run lint` → ejecuta el análisis estático.

## Validación

```bash
npm run build --prefix sice-frontend
npm run lint --prefix sice-frontend
```

El backend se valida con la ruta de salud `GET /` y con pruebas funcionales de los endpoints contra MySQL configurado. El script `npm test` queda pendiente de reemplazar por una suite automatizada.

## Control de versiones

El proyecto se gestiona con Git. El historial conserva commits de implementación incremental del módulo de usuarios y autenticación. La evidencia de la actividad está en `EVIDENCIA_GA7-220501096-AA3-EV02.html` y su versión PDF.

## Dependencias principales

- `express`: servidor HTTP y routing.
- `mysql2`: conexión a MySQL con promesas.
- `dotenv`: carga variables de entorno.
- `bcrypt`: encriptación de contraseñas.

## Estado actual

El backend cuenta con estructura modular, conexión MySQL mediante pool, validación de variables de entorno, autenticación JWT, bcrypt, validadores y middleware global de errores. La aplicación se encuentra en desarrollo y mantiene pendientes las pruebas automatizadas y el despliegue productivo.

## Autor

Carolina Forero
