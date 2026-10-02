# SIGEPOR - Sistema de Gestión Porcina

<div align="center">

![SIGEPOR](https://img.shields.io/badge/SIGEPOR-Sistema%20de%20Gesti%C3%B3n%20Porcina-0A7A4A?style=for-the-badge)

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.22-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-RBAC-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

</div>

## Autores

- Julio Sánchez Rivera
- Daniel Santiago Polania Correa
- Ficha SENA: 3235886

---

## Descripción del Proyecto

**SIGEPOR** es una plataforma integral de software de gestión porcícola diseñada para optimizar y controlar el ciclo biológico, zootécnico y operativo de hatos porcinos. Integra una Single Page Application (**SPA**) moderna construida en **React 18** y **Vite**, con una arquitectura backend desacoplada en capas sobre **Node.js / Express**, respaldada por **MySQL** como motor relacional transaccional.

La plataforma cuenta con control de acceso basado en roles (**RBAC**), enrutamiento protegido, soporte para operación sin conexión (**PWA con IndexedDB y Service Workers**) y sincronización estricta sin falsos positivos.

---

## Características Principales y Módulos

### 1. Autenticación y Control de Acceso por Roles (RBAC)
- Autenticación criptográfica con **JSON Web Tokens (JWT)** y contraseñas hasheadas mediante **Bcrypt (Salt 10)**.
- Jerarquía de roles definida:
  - **👑 Administrador (Rol 1):** Acceso total a usuarios, personal veterinario, inventarios, porcinos y reportes.
  - **👨‍⚕️ Veterinario (Rol 3):** Gestión sanitaria, vacunas, diagnósticos, historial reproductivo y porcinos.
  - **👷 Empleado (Rol 2):** Registro de porcinos, eventos reproductivos y raciones de alimentos.
  - **🛒 Cliente (Rol 4):** Consulta de porcinos en modo lectura.
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

---

## Arquitectura del Repositorio

```text
SIGEPOR PAGINA WEB/
├── database/
│   └── sigepor_database_definitiva.sql  # Script SQL canónico unificado con datos semilla
├── backend/                             # API REST en Node.js / Express
│   ├── src/
│   │   ├── app.js                       # Configuración de Express, CORS y middlewares
│   │   ├── server.js                    # Inicialización del servidor HTTP
│   │   ├── config/
│   │   │   ├── env.js                   # Variables de entorno estrictas (.env)
│   │   │   └── mysql.js                 # Pool mysql2/promise y auto-migración
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # Verificación JWT y requireRole (RBAC)
│   │   │   └── error.middleware.js      # Manejador centralizado de errores HTTP
│   │   ├── modules/                     # Arquitectura modular por capas
│   │   │   ├── auth/                    # Login y validación de usuarios
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
│   │   │   └── axiosClient.js           # Cliente Axios con interceptor Bearer Token
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
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sigepor
JWT_SECRET=sigepor_jwt_secure_secret_key_512bits_2026
```

### 3. Iniciar el Backend
```bash
cd backend
npm install
npm run dev
```
El servidor quedará disponible en `http://localhost:3001`.

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
| **Administrador** | `admin@sigepor.com` | `admin123` | Total (Módulos operativos y Gestión de Usuarios) |
| **Veterinario** | `vet@sigepor.com` | `vet123` | Salud, Vacunas, Porcinos, Reproducción, Inventario y Reportes |
| **Empleado** | `operario@sigepor.com` | `empleado123` | Porcinos, Reproducción e Inventario |
| **Cliente** | `cliente@sigepor.com` | `cliente123` | Consulta de Porcinos |

---

## Guía de Verificación Manual (Paso a Paso)

Para realizar una demostración continua del flujo completo entre **React**, **Express** y **MySQL**:

1. **Asegurar Servicios Activos:**
   - Inicia **MySQL** en el panel de control de **XAMPP**.
   - Inicia el backend en una terminal (`npm run dev` en `backend/`).
   - Inicia el frontend en otra terminal (`npm run dev` en `frontend/`).
2. **Acceder a la Aplicación:**
   - Abre en el navegador `http://localhost:5173/`.
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
Las aserciones validan estrictamente códigos de respuesta `200`, `201`, `401` y `403`. **Ningún código HTTP 500 se valida como respuesta exitosa.**

Para ejecutar el test de integración End-to-End automatizado:
```bash
cd backend
npm run test:e2e
```

---

SIGEPOR © 2026 - Sistema de Gestión Porcina.