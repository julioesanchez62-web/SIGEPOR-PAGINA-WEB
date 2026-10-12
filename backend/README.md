# SIGEPOR Backend - API REST

API REST modular para el Sistema de Gestión Porcina (**SIGEPOR**), construida con **Node.js**, **Express** y **MySQL** (`mysql2/promise`).

---

## Arquitectura y Principios de Diseño

El backend implementa una arquitectura por capas orientada a módulos:
- **Router:** Define las rutas HTTP y aplica middlewares de autenticación (`verifyToken`) y control de acceso por roles (`requireRole`).
- **Validator:** Sanitiza y valida datos de entrada antes de llegar al controlador.
- **Controller:** Orquesta la petición HTTP, llama al servicio y responde con códigos HTTP canónicos.
- **Service:** Contiene la lógica de negocio pura, encriptación con `bcryptjs` y generación de tokens JWT.
- **Repository:** Ejecuta las consultas parametrizadas sobre MySQL utilizando el pool de conexiones.

---

## Módulos del Sistema

- **`auth`:** Login, emisión de JWT y verificación de estado activo del usuario.
- **`porcinos`:** CRUD de animales, gestión zootécnica y asignación de veterinarios.
- **`sanidad`:** Control de vacunas, dosis, fechas de revacunación y enfermedades clínicas.
- **`reproduccion`:** Registro de eventos reproductivos, partos y cálculo de fecha probable.
- **`inventario`:** Control de raciones de alimentos, corrales y proveedores.
- **`veterinarios`:** Directorio del personal médico veterinario.
- **`reportes`:** Alertas sanitarias y hoja de vida por animal.
- **`users`:** Administración de usuarios y roles exclusivo para Administradores.

---

## Configuración y Variables de Entorno

Configura el archivo `.env` en la raíz de `backend/`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sigepor
JWT_SECRET=sigepor_jwt_secure_secret_key_512bits_2026
```

---

## Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Modo desarrollo con nodemon
npm run dev

# Ejecutar suite de pruebas unitarias y de integración
npm test

# Ejecutar prueba de integración End-to-End
npm run test:e2e
```

---

SIGEPOR © 2026.
