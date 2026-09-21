# SIGEPOR

<div align="center">

![SIGEPOR](https://img.shields.io/badge/SIGEPOR-Sistema%20de%20Gesti%C3%B3n%20Porcina-0A7A4A?style=for-the-badge)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

</div>

## Autores

- Julio Sánchez Rivera
- Daniel Santiago Polania Correa
- Ficha SENA: 3235886

## Descripción del proyecto

SIGEPOR es un sistema web de gestión porcina orientado a la administración integral de la producción, sanidad, reproducción, inventarios y trazabilidad de animales. La plataforma combina un frontend en HTML, CSS y JavaScript vanilla con un backend REST desarrollado en Node.js y Express, usando MySQL como motor de persistencia.

El sistema está pensado para apoyar el control operativo del proceso porcino, desde la identificación individual de animales hasta la generación de reportes, alertas y mecanismos de sincronización offline para continuar operando sin conexión.

## Estado del proyecto

El proyecto se encuentra en una etapa de desarrollo funcional con arquitectura modular, autenticación segura, persistencia en base de datos relacional y soporte de operación híbrida online/offline. Se implementan módulos habilitados para producción y gestión operativa del negocio porcícola.

## Características principales

- Autenticación y control de usuarios con JWT y cifrado de contraseñas con `bcryptjs`.
- Gestión porcina con identificación individual, validación de duplicados y soporte para QR/RFID.
- Módulo de reproducción con celos, montas/inseminaciones, partos y destetes.
- Módulo de salud con tratamientos, vacunación y historial sanitario.
- Módulo de inventarios con registro de alimentos e insumos y alertas automáticas de stock mínimo.
- Módulo de reportes y alertas con exportación a PDF y CSV/Excel.
- Modo offline con cola de sincronización local y envío automático a la API (`POST /api/sync`) cuando la red vuelve a estar disponible.
- Frontend dinámico con patrones de interacción en navegador y manejo seguro de sesión.

## Módulos del sistema

### 1. Autenticación y control de usuarios

- Registro y login de usuarios.
- Cifrado de contraseñas usando `bcryptjs`.
- Emisión de tokens JWT para sesiones autenticadas.
- Control de acceso por roles (Administrador, Empleado, Veterinario, Cliente).
- Middleware de validación para rutas protegidas.

### 2. Gestión porcina

- Registro de porcinos y manejo de identificación.
- Validación de duplicados por clave de identificación.
- Registro de información productiva y sanitaria.
- Integración con MySQL como origen central de datos.

### 3. Reproducción

- Manejo de eventos reproductivos.
- Control de celos, montas, inseminaciones y partos.
- Registro de destetes y cálculo de proximidad de partos.

### 4. Salud y sanidad

- Tratamientos médicos.
- Programación y seguimiento de vacunas.
- Historial sanitario por animal.
- Alertas y reportes de salud.

### 5. Inventarios

- Registro de alimentos, materiales e insumos.
- Control de cantidades y alertas por stock mínimo.
- Seguimiento operativo para prevención de faltantes.

### 6. Modo Offline y sincronización automática

- Registro de operaciones pendientes en cola local cuando no hay conexión.
- Escucha de eventos de red (`online` / `offline`).
- Sincronización automática al restablecer Internet.
- Envío de eventos pendientes al backend mediante `POST /api/sync`.

### 7. Reportes y alertas

- Generación de indicadores de rendimiento y sanidad.
- Alertas por condición del sistema, inventario y producción.
- Exportación de reportes en PDF, CSV y Excel.
- Trazabilidad por animal.

## Arquitectura del sistema

El proyecto se estructura sobre una arquitectura en capas orientada a responsabilidades y separación de lógica.

### Patrones aplicados

- Layered Architecture: rutas, validadores, controladores, servicios y repositorios.
- Observer: mecanismos de alerta y sincronización reactiva ante cambios de conectividad.
- Visitor: generación y exportación de reportes y trazabilidad.

### Organización principal

```text
SIGEPOR PAGINA WEB/
├── backend/                     # Backend Node.js / Express
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── routes/
│   │   └── utils/
│   ├── test/
│   ├── package.json
│   └── README.md
├── database/
│   ├── sigepor_database.sql
│   └── sigepor_database_unificada.sql
├── frontend/
│   └── assets/
│       ├── css/
│       ├── js/
│       ├── index.html
│       ├── registro_usuarios.html
│       ├── registroporcino.html
│       ├── vacunas.html
│       ├── veterina rios.html
│       ├── reportes.html
│       └── ...
├── README.md
└── package.json
```

## Tecnologías y dependencias

### Backend

- Node.js
- Express
- `mysql2/promise`
- `dotenv`
- `bcryptjs`
- `jsonwebtoken`
- `cors`
- `supertest`

### Frontend

- HTML5
- CSS3
- JavaScript Vanilla
- Fetch API
- `localStorage`
- Queue Offline Manager / sincronización local

### Base de datos

- MySQL 8

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 18 o superior
- MySQL 8
- Git
- Visual Studio Code (opcional, recomendado)

## Instalación y configuración

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/julioesanchez62-web/SIGEPOR-PAGINA-WEB.git
cd SIGEPOR-PAGINA-WEB
```

### Paso 2: Configurar la base de datos MySQL

Importa el esquema base en MySQL usando el archivo:

```bash
database/sigepor_database.sql
```

Luego crea la base de datos y verifica que las tablas requeridas existan antes de arrancar la API.

### Paso 3: Configurar variables de entorno

Dentro de la carpeta `backend`, crea un archivo `.env` con la siguiente estructura:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sigepor
JWT_SECRET=sigepor_secret_key_2026
```

> Importante: nunca publiques el archivo `.env` ni compartas credenciales reales en repositorios públicos.

### Paso 4: Instalar dependencias del backend

```bash
cd backend
npm install
```

### Paso 5: Ejecutar el backend

```bash
npm run dev
```

O también:

```bash
npm start
```

La API quedará disponible en:

```text
http://localhost:3001
```

### Paso 6: Ejecutar el frontend

Sirve la carpeta `frontend/assets` con un servidor estático o con Live Server en Visual Studio Code.

Ejemplo con Live Server:

1. Abre la carpeta `frontend/assets`.
2. Haz clic derecho en `index.html`.
3. Selecciona `Open with Live Server`.

## Documentación de endpoints principales

### API REST de SIGEPOR

| Método | Ruta | Descripción | Estado esperado |
| --- | --- | --- | --- |
| GET | `/health` | Verifica que el backend está activo. | `200 OK` |
| POST | `/api/auth/login` | Login del sistema con email o usuario y contraseña. | `200 OK` / `401` |
| POST | `/api/users` | Registro de nuevo usuario. | `201 Created` |
| GET | `/api/users` | Consulta usuarios registrados. | `200 OK` |
| POST | `/api/porcinos` | Registro de porcino. | `201 Created` |
| GET | `/api/porcinos` | Listado de porcinos. | `200 OK` |
| POST | `/api/reproduccion` | Registro de eventos reproductivos. | `201 Created` |
| GET | `/api/reproduccion` | Consulta de eventos reproductivos. | `200 OK` |
| POST | `/api/sanidad` | Registro de vacunas o salud. | `201 Created` |
| GET | `/api/sanidad` | Consulta de información sanitaria. | `200 OK` |
| POST | `/api/inventario` | Registro de alimentos o insumos. | `201 Created` |
| GET | `/api/inventario` | Consulta de inventario. | `200 OK` |
| POST | `/api/sync` | Sincronización de cola offline. | `200 OK` |
| GET | `/api/reportes` | Consulta de reportes y alertas. | `200 OK` |

### Ejemplo de login

```http
POST /api/auth/login
Content-Type: application/json

{
  "identificador": "usuario_o_email",
  "contraseña": "tu_contraseña"
}
```

### Respuestas típicas

- `200 OK`: operación exitosa.
- `201 Created`: recurso creado con éxito.
- `400 Bad Request`: datos faltantes o inválidos.
- `401 Unauthorized`: credenciales inválidas o token no válido.
- `403 Forbidden`: el usuario no tiene permisos suficientes.
- `404 Not Found`: recurso no encontrado.
- `500 Internal Server Error`: error del servidor o de base de datos.

## Seguridad

La aplicación implementa buenas prácticas básicas de seguridad para la gestión de usuarios y acceso a recursos:

- Contraseñas cifradas con `bcryptjs`.
- Tokens JWT para gestión de sesiones.
- Middleware de autenticación para rutas restringidas.
- Validación de roles mediante RBAC.
- Restricción de acceso por perfil.

## Pruebas

El backend incluye pruebas automatizadas con Node Test Runner y Supertest.

Para ejecutarlas:

```bash
cd backend
npm test
```

## Flujo recomendado de uso

1. Crear la base de datos desde `database/sigepor_database.sql`.
2. Configurar `.env` con las credenciales MySQL y JWT.
3. Ejecutar el backend con `npm run dev`.
4. Iniciar el frontend con Live Server.
5. Registrar un usuario y autenticarse.
6. Usar módulos de porcinos, reproducción, sanidad, inventario y reportes.
7. Validar sincronización offline cuando la conexión se interrumpe.

## Estado de desarrollo y próximos pasos

El proyecto ya contempla un conjunto de capacidades operativas y funcionales avanzadas. Como próximos pasos recomendados se destacan:

- Fortalecer la validación de datos y sanitización de entradas.
- Expandir pruebas de integración para casos críticos de autenticación y sincronización.
- Mejorar manejo de sesiones y expiración de tokens.
- Rediseñar la estructura del frontend para modularizar más la lógica del cliente.
- Completar la automatización de reportes PDF/Excel con formato empresarial.
- Estabilizar la sincronización offline con auditoría y reconciliación de filas pendientes.

## Documentación adicional

- [Backend](backend/README.md)
- [Base de datos](database/sigepor_database.sql)
- [Arquitectura SQL visual](frontend/assets/ARQUITECTURA_SQL.html)
- [Resumen de mejoras visuales](frontend/assets/RESUMEN_MEJORAS.html)
- [Ejemplos de imágenes](frontend/assets/EJEMPLOS_IMAGENES.html)
- [Prueba de logos](frontend/assets/PRUEBA_LOGOS.html)

## Licencia

Este proyecto fue desarrollado como trabajo de aplicación y gestión técnica para la gestión porcina y puede adaptarse según la política institucional del equipo de desarrollo.

---

SIGEPOR © 2026 - Sistema de Gestión Porcina