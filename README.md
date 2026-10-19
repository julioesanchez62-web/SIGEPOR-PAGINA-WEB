# SIGEPOR - Sistema de Gestión Porcina 2026

Plataforma web integral para la porcicultura moderna, diseñada para optimizar y controlar el ciclo biológico, zootécnico, sanitario y operativo de hatos porcinos. Integra una arquitectura dual: una **Single Page Application (SPA)** en **React 18 + Vite** y un frontend modular con plantillas futuristas en **HTML5/JS**, respaldados por un backend desacoplado en capas sobre **Node.js / Express** y **MySQL** como motor relacional transaccional.

---

## 🏛️ Arquitectura del Sistema

El backend implementa una arquitectura por capas orientada a módulos de dominio:
- **Router:** Define las rutas HTTP y aplica middlewares de autenticación JWT (`verifyToken`) y control de acceso basado en roles (`requireRole`).
- **Validator:** Sanitiza y valida datos de entrada antes de llegar al controlador.
- **Controller:** Orquesta las peticiones HTTP, consume los servicios/repositorios y responde con códigos canónicos de estado HTTP.
- **Service / Repository:** Contiene la lógica de negocio pura, encriptación con `bcryptjs`, generación de tokens JWT y ejecución de consultas SQL parametrizadas sobre MySQL utilizando el pool de conexiones (`mysql2/promise`).

```text
SIGEPOR PAGINA WEB/
├── database/
│   └── sigepor_database_definitiva.sql  # Esquema relacional normalizado con datos semilla
├── backend/                             # API REST en Node.js / Express
│   ├── src/
│   │   ├── app.js                       # Configuración de Express, CORS y sesiones
│   │   ├── server.js                    # Inicialización del servidor HTTP (Puerto 3001)
│   │   ├── config/
│   │   │   ├── env.js                   # Variables de entorno estrictas (.env)
│   │   │   ├── mysql.js                 # Pool mysql2/promise y auto-migración
│   │   │   └── passport.js              # Estrategias OAuth Social (Google y Facebook)
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # Verificación JWT y requireRole (RBAC)
│   │   │   └── error.middleware.js      # Manejador centralizado de errores HTTP
│   │   ├── modules/                     # Módulos por dominio
│   │   │   ├── auth/                    # Login, OAuth, recuperación de contraseña (Email/WhatsApp)
│   │   │   ├── porcinos/                # CRUD de Porcinos y asignación de veterinarios
│   │   │   ├── sanidad/                 # Vacunación y enfermedades clínicas
│   │   │   ├── reproduccion/            # Eventos reproductivos, montas y partos
│   │   │   ├── inventario/              # Alimentos, raciones, corrales y proveedores
│   │   │   ├── veterinarios/            # Gestión de personal veterinario (Admin)
│   │   │   ├── reportes/                # Alertas sanitarias y hoja de vida individual
│   │   │   ├── corrales/                # Módulo CRUD de alojamiento
│   │   │   ├── enfermedades/            # Módulo CRUD de historial clínico
│   │   │   ├── logs_actividad/          # Trazabilidad de auditoría
│   │   │   └── users/                   # Administración de usuarios y RBAC
│   │   └── routes/
│   │       └── index.js                 # Enrutador central y endpoints de selectores
│   ├── test/                            # Suite automatizada (Node Test Runner + Supertest)
│   │   ├── auth.test.js                 # Pruebas de autenticación y RBAC
│   │   ├── health.test.js               # Verificación de salud del servidor
│   │   ├── routes.test.js               # Pruebas de endpoints REST
│   │   └── e2e-integration.test.js      # Test de integración End-to-End
│   └── .env                             # Variables de configuración
├── frontend/                            # SPA en React 18 + Vite
│   ├── public/
│   │   ├── manifest.json                # Manifiesto PWA
│   │   └── sw.js                        # Service Worker para funcionamiento offline
│   ├── src/
│   │   ├── api/                         # Cliente Axios centralizado con interceptor JWT
│   │   ├── context/                     # AuthContext (RBAC) y NetworkSyncContext
│   │   ├── components/                  # Navbar, Sidebar, Modal, Alert, ProtectedRoute
│   │   └── pages/                       # Vistas por módulo
│   └── assets/                          # Vistas HTML5 / JS con tema corporativo 2026
│       ├── css/optipig-theme.css        # Tema Glassmorphism (Dark & Light Theme)
│       ├── js/auth_guard.js             # Guardián de rutas, RBAC, FAB WhatsApp y Theme Toggle
│       ├── js/registro_porcino.js       # CRUD reactivo y código QR / RFID
│       ├── js/offline_sync.js           # PWA con sincronización IndexedDB
│       ├── index.html                   # Login y modal de recuperación de contraseña
│       ├── indexpruebados.html          # Panel principal / Dashboard
│       ├── registroporcino.html         # Módulo de porcinos
│       ├── vacunas.html                 # Módulo de vacunación con KPIs reactivos
│       ├── corrales.html                # Módulo de corrales con KPIs reactivos
│       ├── enfermedades.html            # Módulo de diagnósticos clínicos con KPIs reactivos
│       ├── veterinarios.html            # Módulo protegido de veterinarios (Solo Admin)
│       ├── gestion_usuarios.html        # Panel interno administrativo de usuarios
│       ├── registro_usuarios.html       # Registro público seguro (Rol Cliente por defecto)
│       └── inicio.html                  # Alias transparente de redirección a dashboard
└── README.md
```

---

## 🚀 Historial de Últimas Modificaciones (Paso a Paso)

A continuación se detalla cronológicamente la evolución técnica y las mejoras implementadas recientemente en la plataforma:

### 1. Refactorización Estructural de Base de Datos MySQL (Normalización y Buenas Prácticas)
- **Renombrado de Llaves Primarias:** Se renombraron las claves de identificación primaria para cumplir con los estándares canónicos relacionales:
  - `usuarios.id` $\rightarrow$ `usuarios.id_usuario`
  - `corrales.id` $\rightarrow$ `corrales.id_corral`
  - `porcinos.id` $\rightarrow$ `porcinos.id_porcino`
  - `veterinarios.id` $\rightarrow$ `veterinarios.id_veterinario`
- **Adición de Llaves Foráneas (FK) y Relaciones:**
  - `veterinarios.id_usuario` $\rightarrow$ `usuarios(id_usuario)`
  - `porcinos.id_corral` $\rightarrow$ `corrales(id_corral)`
  - `alimentacion.id_porcino` $\rightarrow$ `porcinos(id_porcino)` y `alimentacion.id_usuario` $\rightarrow$ `usuarios(id_usuario)`
  - `vacunacion.id_veterinario` $\rightarrow$ `veterinarios(id_veterinario)`
  - `logs_actividad.id_usuario` $\rightarrow$ `usuarios(id_usuario)`
- **Actualización Backend (Consultas SQL):** Se adaptaron todos los repositorios (`porcinos`, `users`, `veterinarios`, `sanidad`, `reproduccion`, `inventario`, `reportes`, `auth`) implementando proyecciones con alias dual (`id_porcino AS id`, `id_usuario AS id`, etc.) para asegurar compatibilidad total con el frontend existente.

### 2. Remediación de Vulnerabilidad de Escalada de Privilegios
- **Problema de Seguridad:** El formulario público en `registro_usuarios.html` permitía al usuario seleccionar su propio rol (Administrador, Veterinario, Cliente), permitiendo una escalada no autorizada de privilegios.
- **Frontend (`registro_usuarios.html`):** Se eliminó por completo el `<select>` de selección de roles del formulario público, preservando el balance estético del diseño visual.
- **Backend (`auth.controller.js` y `users.controller.js`):** Se eliminó la recepción del campo `rol` en el registro público. La consulta `INSERT` asigna automáticamente el rol de privilegios mínimos por defecto (`idRol = 4`, Cliente). Todo intento de inyectar un rol superior en el payload JSON es rechazado e ignorado.
- **Panel Administrativo Exclusivo (`gestion_usuarios.html`):** Creación de un módulo administrativo interno protegido (solo accesible por Administradores) con tabla de usuarios, selector de roles RBAC y control de estado activo/inactivo.

### 3. Ajuste de Permisos RBAC para el Rol "Veterinario"
- **Lógica de Negocio:** Un veterinario debe gestionar la salud y producción animal, pero no debe tener permisos para gestionar ni administrar los perfiles de otros veterinarios o el personal del sistema (tarea reservada exclusivamente al Administrador).
- **Menú Lateral (Renderizado Condicional):** Se actualizó `auth_guard.js` para que, cuando el usuario autenticado sea `Veterinario` (Rol 3), el enlace a `veterinarios.html` se oculte automáticamente del menú lateral (`display: none !important`, `aria-hidden="true"`), manteniendo acceso visible a Porcinos, Corrales, Enfermedades, Vacunación, Inventario y Reproducción.
- **Guardián de Rutas (Route Guard):**
  - Si un usuario con rol Veterinario (o Cliente/Empleado) intenta forzar la URL de `veterinarios.html`, el sistema intercepta la navegación antes de pintar el DOM (`pre-render guard`), muestra un Toast no bloqueante con el mensaje *"Acceso Denegado: Exclusivo para Administradores"* y redirige inmediatamente a `inicio.html`.
  - Se creó `inicio.html` como alias transparente hacia el panel principal (`indexpruebados.html`).
- **Protección Backend (`/api/veterinarios`):** Todos los endpoints CRUD de la ruta (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`) en `veterinarios.routes.js` aplican estrictamente el middleware `requireRole(['Administrador', 1])`, devolviendo `403 Forbidden` a usuarios con rol Veterinario o inferior.

### 4. Recuperación de Contraseña Funcional (Email & WhatsApp)
- **Frontend (`index.html`):** Al hacer clic en *"¿Olvidaste tu contraseña? Recuperar aquí"*, se abre un modal con selector de pestañas:
  - **📧 Recuperar por Correo Electrónico:** Captura la dirección de correo registrada.
  - **💬 Recuperar por Código de WhatsApp:** Captura el número telefónico / celular registrado.
- **Backend (`POST /api/recuperar-password`):** Controlador estandarizado en `auth.controller.js` que genera un PIN de verificación numérico seguro de 6 dígitos con stubs listos para producción para:
  - **Nodemailer (SMTP):** Envío de correo HTML con plantilla corporativa.
  - **WhatsApp API:** Integración con Twilio WhatsApp SDK o Meta WhatsApp Cloud API (Graph API).

### 5. Botón Flotante Global de Soporte por WhatsApp (FAB)
- **Inyección Centralizada:** En `auth_guard.js` se implementó `inyectarBotonFlotanteWhatsApp()`, inyectando automáticamente el botón en **todas** las páginas HTML del sistema.
- **Diseño y Estilo:** Posicionado en la esquina inferior derecha (`bottom: 25px; right: 25px; z-index: 9999`), con icono vectorial oficial SVG, gradiente verde WhatsApp, tooltip animado (*"💬 Soporte WhatsApp 24/7"*) y enlace dinámico `https://wa.me/TUNUMERO?text=...`.

### 6. Toggle de Modo Claro / Modo Oscuro con Persistencia
- **Navbar Switch:** Botón interactivo en `.top-navbar .nav-right-actions` (*"☀️ Modo Claro"* / *"🌙 Modo Oscuro"*).
- **Estilos CSS (`optipig-theme.css`):** Variables y selectores bajo `.light-theme` invirtiendo fondos a tonos claros pulidos (`#f1f5f9`, tarjetas `#ffffff`, tipografía `#0f172a`), preservando la legibilidad de tablas, estados sanitarios y la identidad de marca esmeralda y cian.
- **Persistencia y Prevención FOUC:** Guarda la preferencia en `localStorage.getItem('sigepor_theme')` y la aplica de forma inmediata en el `<head>` antes del renderizado.

### 7. Reactividad en Tiempo Real de Contadores KPI (DOM Updates)
- **Módulo de Vacunación (`vacunas.html`):** Creación de la función `actualizarContadoresVacunas(datos)`. Las operaciones de carga (`GET`), registro (`POST`) y eliminación (`DELETE`) actualizan inmediatamente las cifras de *Total Vacunas*, *Aplicadas* y *Pendientes* sin recargar la página.
- **Replicación en Toda la Aplicación:**
  - `corrales.html`: Función `actualizarContadoresCorrales(lista)` con recálculo dinámico de *Total Corrales*, *Capacidad Total de Animales* y *Corrales Limpios*.
  - `enfermedades.html`: Función `actualizarContadoresEnfermedades(lista)` con recálculo de *Total Diagnósticos*, *En Tratamiento / Observación* y *Casos Recuperados*.
  - `registroporcino.html`: Invocación reactiva de `actualizarEstadisticasCalculadas(porcinos)`.
  - `veterinarios.html`: Invocación reactiva de `actualizarEstadisticasCalculadas(veterinarios)`.

---

## 👥 Matriz de Roles y Permisos (RBAC)

| Módulo / Vista | 👑 Administrador (1) | 👨‍⚕️ Veterinario (3) | 👷 Empleado (2) | 🛒 Cliente (4) |
| :--- | :---: | :---: | :---: | :---: |
| **Inicio / Dashboard** (`indexpruebados.html`) | ✅ Acceso Total | ✅ Acceso Total | ✅ Acceso Total | ✅ Acceso Total |
| **Porcinos** (`registroporcino.html`) | ✅ CRUD Total | ✅ CRUD Operativo | ✅ CRUD Operativo | 👁️ Solo Lectura |
| **Corrales** (`corrales.html`) | ✅ CRUD Total | ✅ Consulta / Asig. | ✅ Consulta / Asig. | ❌ Oculto |
| **Enfermedades** (`enfermedades.html`) | ✅ CRUD Total | ✅ Diagnóstico Clínico | ❌ Oculto | ❌ Oculto |
| **Vacunación** (`vacunas.html`) | ✅ CRUD Total | ✅ Aplicación y Control | ❌ Oculto | ❌ Oculto |
| **Reproducción** (`reproduccion.html`) | ✅ CRUD Total | ✅ Control Reproductivo | ✅ Registro Montas | ❌ Oculto |
| **Inventario** (`inventario.html`) | ✅ CRUD Total | ✅ Raciones / Insumos | ✅ Raciones / Insumos | ❌ Oculto |
| **Proveedores** (`proveedores.html`) | ✅ CRUD Total | ❌ Oculto | ✅ Consulta | ❌ Oculto |
| **Logs de Actividad** (`logs_actividad.html`) | ✅ Auditoría Total | ❌ Oculto | ❌ Oculto | ❌ Oculto |
| **Personal Veterinario** (`veterinarios.html`) | ✅ Exclusivo Admin | ⛔ Acceso Denegado | ⛔ Acceso Denegado | ⛔ Acceso Denegado |
| **Gestión de Usuarios** (`gestion_usuarios.html`) | ✅ Exclusivo Admin | ⛔ Acceso Denegado | ⛔ Acceso Denegado | ⛔ Acceso Denegado |
| **Reportes y Alertas** (`reportes.html`) | ✅ Monitoreo Total | ✅ Alertas Sanitarias | ❌ Oculto | ❌ Oculto |

---

## 🛠️ Instalación y Puesta en Marcha

### Requisitos del Sistema
- **Node.js:** v18.0.0 o superior (v20+ recomendado).
- **MySQL Server:** v8.0+ o MariaDB (puerto default 3306).
- **NPM:** v9.0.0 o superior.

### 1. Configuración de Base de Datos
Importa el script SQL definitivo en tu servidor MySQL (Workbench, phpMyAdmin o terminal):
```bash
mysql -u root -p sigepor < database/sigepor_database_definitiva.sql
```

### 2. Configuración del Backend (`backend/`)
Crea o edita el archivo `backend/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sigepor
JWT_SECRET=sigepor_jwt_secure_secret_key_512bits_2026
```

Instala las dependencias y ejecuta el servidor:
```bash
cd backend
npm install
npm run dev
```
El servidor backend se ejecutará en: `http://localhost:3001`.

### 3. Configuración del Frontend React (`frontend/`)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La SPA en React se abrirá en: `http://localhost:5173`.
Las vistas HTML5 interactivas se sirven directamente o a través del servidor en: `http://localhost:3001/index.html`.

---

## 🧪 Pruebas Automatizadas

El backend cuenta con una suite completa de pruebas unitarias, de autorización y de integración End-to-End ejecutadas mediante el runner nativo de Node.js (`node --test`) y **Supertest**:

```bash
cd backend
npm test
```

### Cobertura de las 16 Pruebas Automatizadas:
- [x] `GET /api/porcinos` sin token retorna `401 Unauthenticated`.
- [x] `GET /api/porcinos` con token inválido retorna `401 Unauthorized`.
- [x] `GET /api/users` con rol Empleado retorna `403 Forbidden` (RBAC).
- [x] `GET /api/porcinos` con rol Administrador retorna `200 OK`.
- [x] `GET /api/veterinarios` con rol Veterinario retorna `403 Forbidden` (Exclusivo Administrador).
- [x] Flujo E2E Completo: Login JWT $\rightarrow$ Inserción de Porcino $\rightarrow$ Persistencia física en MySQL $\rightarrow$ Limpieza.
- [x] `GET /health` responde `200 OK` con estado del servidor.
- [x] Verificación de respuestas canónicas `200` en módulos de Porcinos, Veterinarios (Admin), Reproducción, Sanidad/Vacunas, Inventario y Reportes.
- [x] **Cero códigos HTTP 500 aceptados como válidos.**

Para compilar el frontend React de producción:
```bash
cd frontend
npm run build
```

---

## 🔑 Credenciales de Prueba

| Perfil | Identificador / Correo | Contraseña | Alcance |
| :--- | :--- | :--- | :--- |
| **👑 Administrador** | `admin@sigepor.com` | `admin123` | Control total del sistema y gestión de personal/usuarios |
| **👨‍⚕️ Veterinario** | `vet@sigepor.com` | `vet123` | Salud, vacunas, diagnósticos, producción y reportes |
| **👷 Empleado** | `operario@sigepor.com` | `empleado123` | Porcinos, corrales, raciones y reproducción |
| **🛒 Cliente** | `cliente@sigepor.com` | `cliente123` | Catálogo informativo de porcinos en modo lectura |

---

## 📄 Licencia y Derechos

SIGEPOR © 2026 - Todos los derechos reservados. Sistema de Gestión Porcina.
