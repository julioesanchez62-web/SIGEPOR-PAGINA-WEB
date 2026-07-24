# SICE Backend

Backend del sistema SICE desarrollado con Node.js, Express y MySQL.

## Descripción

API REST modular para el sistema SICE, con capas separadas de rutas, controladores, servicios y repositorios.

## Requisitos

- Node.js v18 o superior
- MySQL
- npm

## Instalación

1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
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
PORT=3000
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

- `GET /api/auth/login` → ruta de ejemplo disponible en el módulo `auth`, pero no está montada en la aplicación principal actualmente.

## Dependencias principales

- `express`: servidor HTTP y routing.
- `mysql2`: conexión a MySQL con promesas.
- `dotenv`: carga variables de entorno.
- `bcrypt`: encriptación de contraseñas.

## Estado actual

El backend está en desarrollo con estructura modular y soporte básico para gestión de usuarios.
La conexión MySQL se valida al iniciar el servidor, y el proyecto ya cuenta con un flujo de validación, servicio/repo y manejo de errores.

## Autor

Carolina Forero
