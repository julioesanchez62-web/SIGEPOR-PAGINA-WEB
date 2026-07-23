# SICE Backend

Backend del sistema SICE desarrollado con Node.js y Express.

## Descripción

Este proyecto proporciona la API REST para gestionar la lógica del backend del sistema, con una estructura modular por funcionalidades.

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

## Ejecución

Modo de desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

## Estructura del proyecto

- `src/app.js`: configuración principal de Express
- `src/server.js`: arranque del servidor y conexión a la base de datos
- `src/config/`: archivos de configuración global y conexión MySQL
- `src/modules/`: módulos organizados por funcionalidad
  - `auth/`: autenticación
  - `users/`: gestión de usuarios
- `src/middlewares/`: middlewares globales
- `src/utils/`: utilidades compartidas

## Endpoints principales

### Usuarios

- `POST /api/users` → crear un usuario

### Autenticación

- `GET /api/auth/login` → ruta de ejemplo para login

## Archivos de configuración

### package.json

Este archivo define el nombre del proyecto, los scripts de ejecución, las dependencias de producción y las herramientas de desarrollo necesarias para correr el backend.

### package-lock.json

Este archivo registra la versión exacta de cada dependencia instalada y sirve para que la instalación sea reproducible y consistente entre entornos.

## Estado actual

El backend está en una etapa inicial de desarrollo con estructura modular y flujo base para usuarios y autenticación.

## Autor

Carolina Forero
