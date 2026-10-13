# SIGEPOR Backend - API REST

API REST modular para el Sistema de Gestión Porcina (**SIGEPOR**), construida con **Node.js**, **Express** y **MySQL** (`mysql2/promise`).

---

## Arquitectura y Principios de Diseño

<<<<<<< HEAD
**SIGEPOR** es una plataforma integral de gestión porcícola diseñada para optimizar y controlar el ciclo biológico, zootécnico y operativo de hatos porcinos. Integra una Single Page Application (**SPA**) moderna construida en **React 18** y **Vite**, con una arquitectura backend desacoplada en capas sobre **Node.js / Express**, respaldada por **MySQL** como motor relacional transaccional.

La plataforma cuenta con control de acceso basado en roles (**RBAC**), enrutamiento protegido, soporte para operación sin conexión (**PWA con IndexedDB y Service Workers**) y sincronización estricta sin falsos positivos.

---

## Historial de Últimas Modificaciones (Paso a Paso)

A continuación se detalla cronológicamente la evolución técnica y las mejoras implementadas en la plataforma:

### 1. Estandarización Visual, Tema Corporativo y Botones Sociales OAuth
- **Index y Formularios:** Se unificó el diseño visual con la paleta corporativa oscura/verde esmeralda (`#07090e`, `#10b981`, `#1a2332`), eliminando textos rezagados o inconsistencias estéticas.
- **Acceso Social (Google y Facebook):** Integración de botones interactivos con SVG vectoriales oficiales en las vistas de login y registro, conectándolos a `/api/auth/google` y `/api/auth/facebook` con Passport.js y captura automática de parámetros de redirección (`?token=...&usuario=...`) en `localStorage`.
- **Listas Desplegables Dinámicas:** Reemplazo de inputs de texto plano por elementos `<select>` enlazados a la base de datos (Veterinarios en Logs de Actividad, Proveedores en Inventario, Corrales en Inventario y Porcinos en Vacunación).
- **Gestión de Teléfono:** Inclusión y procesamiento íntegro del campo `telefono` en el módulo de usuarios y bases de datos MySQL, resolviendo errores de parámetros indefinidos.

### 2. Unificación y Estandarización de Respuesta del Login (JWT)
- **Problema Detectado:** El frontend arrojaba la alerta *"La respuesta del servidor no incluyó un token válido"* debido a una disparidad entre la envoltura JSON del backend y la expectativa de captura en React.
- **Backend (`POST /api/auth/login`):** Se adaptaron `auth.controller.js` y `users.controller.js` para entregar una estructura limpia y estandarizada:
  ```json
  {
    "status": "success",
    "message": "¡Login exitoso!",
    "token": "eyJhbGciOi...",
    "usuario": { "id": 1, "nombre": "...", "email": "...", "rol": 1, "idRol": 1, "rolNombre": "Administrador" },
    "user": { ... },
    "data": { ... }
  }
  ```
- **Frontend (`AuthContext.jsx`):** Se implementó una extracción flexible y robusta del token (`response?.token || response?.data?.token || response?.user?.token`) y su almacenamiento estricto bajo `localStorage.setItem('sigepor_token', jwtToken)` y `usuario_sigepor`.
- **Redirección por Rol:** En `LoginPage.jsx` se configuró la redirección inteligente pos-autenticación según el perfil (`Veterinario` $\rightarrow$ `/vacunas`, `Cliente` $\rightarrow$ `/reportes`, `Administrador`/`Empleado` $\rightarrow$ `/porcinos`).

### 3. Corrección del Renderizado del Módulo de Reportes
- **Problema Detectado:** Al ingresar a la vista de "Reportes y Alertas" en React, la pantalla quedaba completamente en blanco.
- **Diagnóstico:** El backend agrupaba las alertas en sub-objetos (`{ salud: [...], reproduccion: [...], vacunacion: [...] }`) mientras el frontend intentaba iterar un arreglo plano (`alertas.map(...)`). Adicionalmente, el router del backend sólo exponía `/alertas` y no la raíz `/reportes`.
- **Backend (`reportes.routes.js`):** Se expuso `router.get('/', controller.getAlertas)` junto con `router.get('/alertas', controller.getAlertas)`.
- **Frontend (`ReportesPage.jsx` y `reportes.service.js`):**
  - Implementación de la función `normalizarAlertas(raw)` para aplanar y formatear las alertas sanitarias, reproductivas y clínicas.
  - Inclusión de estados de carga (`loadingAlertas`), bloques `try/catch` y pantallas amigables de estado vacío en lugar de colapsar la interfaz.
  - Aseguramiento de la exportación por defecto `export default ReportesPage;`.

### 4. Auditoría de Seguridad y Pruebas End-to-End
- **Modo Solo Lectura para Clientes:** En `PorcinosPage.jsx` y `App.jsx`, el rol Cliente (Rol 4) no tiene acceso a botones de creación, edición o borrado (`canEdit = false`, `canDelete = false`).
- **Validación de Usuario Activo:** El backend exige `activo = 1` antes de firmar cualquier token JWT; de lo contrario responde con `HTTP 403 Forbidden`.
- **Blindaje de Creación de Administradores:** `POST /api/users` rechaza con `HTTP 403` cualquier intento público o no autenticado de registrar usuarios con `idRol = 1`.
- **Limpieza de Secretos:** Centralización estricta de variables en `backend/.env` y `backend/src/config/env.js`, eliminando valores por defecto o secretos quemados en el código.
- **Aserciones en Pruebas:** Las 15 pruebas automatizadas del backend con `node --test` y Supertest exigen códigos válidos (`200`, `201`, `401`, `403`) y rechazan explícitamente códigos `500`.

---

## Características Principales y Módulos

### 1. Autenticación y Control de Acceso por Roles (RBAC)
- Autenticación criptográfica con **JSON Web Tokens (JWT)** y contraseñas hasheadas mediante **Bcrypt (Salt 10)**.
- Jerarquía de roles definida:
  - **👑 Administrador (Rol 1):** Acceso total a usuarios, personal veterinario, inventarios, porcinos y reportes.
  - **👨‍⚕️ Veterinario (Rol 3):** Gestión sanitaria, vacunas, diagnósticos, historial reproductivo y porcinos.
  - **👷 Empleado (Rol 2):** Registro de porcinos, eventos reproductivos y raciones de alimentos.
  - **🛒 Cliente (Rol 4):** Consulta de porcinos en modo solo lectura.
- Restricción estricta en `POST /api/users`: Bloqueo de asignación del rol Administrador a peticiones públicas o sin privilegios de administrador.
- Verificación del estado activo (`activo = 1`) antes de emitir tokens en el login.

### 2. Gestión Integral de Porcinos
- Registro, edición y seguimiento individual por identificación/arete.
- Control de raza, peso, género, fecha de nacimiento y estado de salud.
- Asignación de médico veterinario responsable por animal.

### 3. Sanidad, Vacunación y Tratamientos Clínicos
- Registro de dosis de vacunas aplicadas y cálculo de fecha de revacunación.
- Control de enfermedades, diagnósticos veterinarios y prescripción de tratamientos.

### 4. Reproducción y Partos
- Registro de montas e inseminaciones artificiales.
- Cálculo automático de la fecha probable de parto (+114 días de gestación).
- Registro de partos asistidos y número de lechones nacidos vivos.

### 5. Inventario y Logística
- Control de raciones de alimentos por corral y cantidades suministradas.
- Infraestructura de corrales, capacidad de animales y estado de limpieza.
- Directorio de proveedores aliados.

### 6. Modo Offline y PWA (IndexedDB + Service Worker)
- Aplicación Web Progresiva instalable con soporte sin conexión.
- Cola de mutaciones pendientes en **IndexedDB** (`offline_queue`).
- Sincronización automática al recuperar la conexión a internet.
- **Validación estricta de respuestas HTTP:** Únicamente los códigos `2xx` se consideran éxito; los errores `4xx` se alertan al usuario y se descartan para evitar registrar datos falsos.

### 7. Reportes y Trazabilidad Operativa
- Monitor en vivo de alertas sanitarias y operativas del hato.
- Consulta de hoja de vida y trazabilidad histórica individual por animal.
=======
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
>>>>>>> 06253f6e3e157a3982bab84029e3c25f2a5590a4

---

## Configuración y Variables de Entorno

<<<<<<< HEAD
```text
SIGEPOR PAGINA WEB/
├── database/
│   └── sigepor_database_definitiva.sql  # Script SQL canónico unificado con datos semilla
├── backend/                             # API REST en Node.js / Express
│   ├── src/
│   │   ├── app.js                       # Configuración de Express, CORS y sesiones
│   │   ├── server.js                    # Inicialización del servidor HTTP
│   │   ├── config/
│   │   │   ├── env.js                   # Variables de entorno estrictas (.env)
│   │   │   ├── mysql.js                 # Pool mysql2/promise y auto-migración
│   │   │   └── passport.js              # Configuración de OAuth Social
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # Verificación JWT y requireRole (RBAC)
│   │   │   └── error.middleware.js      # Manejador centralizado de errores HTTP
│   │   ├── modules/                     # Arquitectura modular por capas
│   │   │   ├── auth/                    # Login, OAuth y validación de usuarios
│   │   │   ├── porcinos/                # CRUD de Porcinos
│   │   │   ├── sanidad/                 # Vacunas y Enfermedades
│   │   │   ├── reproduccion/            # Eventos Reproductivos
│   │   │   ├── inventario/              # Alimentos, Corrales, Proveedores
│   │   │   ├── veterinarios/            # Personal Veterinario
│   │   │   ├── reportes/                # Alertas y Trazabilidad
│   │   │   └── users/                   # Administración de Usuarios
│   │   └── routes/
│   │       └── index.js                 # Enrutador principal y health check
│   ├── test/                            # Suite automatizada con Supertest
│   │   ├── auth.test.js
│   │   ├── health.test.js
│   │   ├── routes.test.js
│   │   └── e2e-integration.test.js      # Test de integración E2E completo
│   └── .env                             # Variables de configuración
├── frontend/                            # SPA moderna en React 18 + Vite
│   ├── public/
│   │   ├── manifest.json                # Manifiesto PWA
│   │   └── sw.js                        # Service Worker para funcionamiento offline
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js           # Cliente Axios con interceptor Bearer Token
│   │   │   ├── auth.service.js
│   │   │   ├── porcinos.service.js
│   │   │   ├── reportes.service.js
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Estado de sesión y control RBAC
│   │   │   └── NetworkSyncContext.jsx   # Gestor de conectividad e IndexedDB
│   │   ├── components/                  # Navbar, Sidebar, Modal, Alert, ProtectedRoute
│   │   └── pages/                       # Vistas por módulo del sistema
│   └── vite.config.js                   # Configuración de Vite y proxy
└── README.md
```

---

## Instalación y Puesta en Marcha

### Requisitos Previos
- **Node.js** v18 o superior (v24 recomendado).
- **MySQL Server** 8.0+ o MariaDB (vía XAMPP o servicio nativo en puerto 3306).

### 1. Base de Datos
Importa en MySQL Workbench o phpMyAdmin el archivo definitivo:
```bash
mysql -u root -p sigepor < database/sigepor_database_definitiva.sql
```

### 2. Configurar Variables de Entorno del Backend
Crea o edita `backend/.env`:
=======
Configura el archivo `.env` en la raíz de `backend/`:
>>>>>>> 06253f6e3e157a3982bab84029e3c25f2a5590a4
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

<<<<<<< HEAD
### 4. Iniciar el Frontend (React)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación React se abrirá en `http://localhost:5173`.

---

## Usuarios de Prueba (Datos Semilla)

| Perfil / Rol | Correo Electrónico | Contraseña | Nivel de Acceso |
| :--- | :--- | :--- | :--- |
| **👑 Administrador** | `admin@sigepor.com` | `admin123` | Total (Módulos operativos y Gestión de Usuarios) |
| **👨‍⚕️ Veterinario** | `vet@sigepor.com` | `vet123` | Salud, Vacunas, Porcinos, Reproducción, Inventario y Reportes |
| **👷 Empleado** | `operario@sigepor.com` | `empleado123` | Porcinos, Reproducción e Inventario |
| **🛒 Cliente** | `cliente@sigepor.com` | `cliente123` | Consulta de Porcinos (Solo lectura) |

---

## Guía de Verificación Manual (Paso a Paso)

Para realizar una demostración continua del flujo completo entre **React**, **Express** y **MySQL**:

1. **Asegurar Servicios Activos:**
   - Inicia **MySQL** en el panel de control de **XAMPP**.
   - Inicia el backend en una terminal (`npm run dev` en `backend/`).
   - Inicia el frontend en otra terminal (`npm run dev` en `frontend/`).
2. **Acceder a la Aplicación:**
   - Abre en el navegador `http://localhost:5173/login`.
   - Haz clic en la pestaña **👑 Administrador** (se autocompleta `admin@sigepor.com`).
   - Digita la contraseña `admin123` e inicia sesión.
3. **Verificar Token JWT en Navegador:**
   - Abre las Herramientas de Desarrollador con `F12`.
   - En la pestaña **Application** &rarr; **Local Storage**, comprueba la clave `sigepor_token` con el JWT firmado.
4. **Registrar un Porcino:**
   - En el menú lateral, dirígete a **Porcinos**.
   - Haz clic en el botón **➕ Registrar Nuevo Porcino**.
   - Completa el formulario con una identificación única (ej. `POR-9999`), peso, estado de salud y veterinario.
   - Presiona **Guardar en MySQL**.
5. **Comprobar Petición de Red:**
   - En la pestaña **Network (Red)** de DevTools (`F12`), filtra por `Fetch/XHR`.
   - Revisa la petición `POST /api/porcinos`.
   - En la sección **Headers**, verifica la presencia del encabezado:
     ```http
     Authorization: Bearer eyJhbGciOi...
     ```
   - El código devuelto por Express es **`201 Created`**.
6. **Validar Persistencia en MySQL:**
   - En phpMyAdmin o MySQL Workbench ejecuta:
     ```sql
     SELECT * FROM porcinos WHERE identificacion = 'POR-9999';
     ```
   - El registro se encuentra persistido físicamente con su ID autoincremental y fecha de registro.

---

## Pruebas Automatizadas

El backend incluye pruebas automatizadas con el **Node Test Runner** nativo (`node --test`) y **Supertest**:

```bash
cd backend
npm test
```
Las 15 pruebas unitarias y de integración validan estrictamente códigos de respuesta `200`, `201`, `401` y `403`. **Ningún código HTTP 500 se valida como respuesta exitosa.**
=======
# Ejecutar suite de pruebas unitarias y de integración
npm test
>>>>>>> 06253f6e3e157a3982bab84029e3c25f2a5590a4

# Ejecutar prueba de integración End-to-End
npm run test:e2e
```

---

SIGEPOR © 2026.
