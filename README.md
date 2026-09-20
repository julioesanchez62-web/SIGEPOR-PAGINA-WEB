# SIGEPOR

Sistema web para la gestion de informacion porcina, usuarios, vacunas y veterinarios.

## Estado actual

El proyecto cuenta con un frontend HTML/CSS/JavaScript y un backend REST desarrollado con Node.js, Express y MySQL.

### Avances completados

- Pagina principal con presentacion de SIGEPOR, acceso al login y registro de cuenta.
- Diseno visual responsive para escritorio, tablet y movil.
- Estilos centralizados en `frontend/assets/css/style.css`.
- Navegacion lateral en las pantallas internas.
- Gestion de porcinos con formulario, tabla, estadisticas y persistencia local.
- Formularios para actualizacion de datos, vacunas y restauracion.
- Backend organizado por modulos y capas: rutas, validadores, controladores, servicios y repositorios.
- Conexion a MySQL mediante `mysql2/promise` y pool de conexiones.
- CORS y parser JSON configurados en Express.
- Endpoint de verificacion disponible en `GET /health`.
- CRUD de usuarios disponible mediante la API.
- Login conectado a MySQL mediante `POST /api/users/login`.
- El login acepta un usuario o un correo electronico junto con la contrasena.
- La interfaz guarda los datos basicos del usuario autenticado en `localStorage`.
- Pruebas automatizadas del backend ejecutadas correctamente.

## Estructura del proyecto

```text
SIGEPOR PAGINA WEB/
├── backend/                    # Backend legacy del prototipo inicial
├── database/
│   └── sigepor_database.sql    # Esquema y datos de referencia del prototipo
├── frontend/
│   └── assets/
│       ├── index.html
│       ├── registro_usuarios.html
│       ├── registroporcino.html
│       ├── vacunas.html
│       ├── actualizacion_datos.html
│       ├── restaurar.html
│       ├── css/style.css
│       ├── images/
│       └── js/script.js
├── SIGEPOR_BACKEND/            # Backend activo
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── modules/users/
│   ├── test/health.test.js
│   ├── package.json
│   └── README.md
└── README.md
```

El backend activo es `SIGEPOR_BACKEND`. La carpeta `backend` corresponde a una implementacion anterior y no debe utilizarse para iniciar la aplicacion actual.

## Tecnologias

- HTML5, CSS3 y JavaScript vanilla.
- Node.js y CommonJS.
- Express 4.
- MySQL 8.
- `mysql2/promise` para acceso a datos.
- `bcryptjs` como dependencia preparada para el manejo seguro de contrasenas.
- `supertest` y Node Test Runner para pruebas.

## Configuracion de MySQL

El backend actual utiliza la base de datos `sigepor`. Crea el archivo `SIGEPOR_BACKEND/.env` con una configuracion equivalente a esta y reemplaza los valores segun tu instalacion:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sigepor
```

La tabla utilizada para el login es `usuarios` y contiene, entre otros, estos campos:

```text
id, nombre, email, usuario, contrasena, fecha_registro, activo
```

En la base real el nombre de la columna de contrasena es `contraseña`. El repositorio la consulta usando ese nombre y expone los datos publicos mediante alias cuando corresponde.

No publiques el archivo `.env` ni incluyas contrasenas reales en el repositorio.

## Instalacion y ejecucion

Desde la raiz del proyecto:

```bash
cd SIGEPOR_BACKEND
npm install
npm run dev
```

El servidor queda disponible en:

```text
http://localhost:3001
```

Para abrir el frontend, abre `frontend/assets/index.html` con Live Server o sirve la carpeta `frontend/assets` mediante un servidor estatico. El formulario de login realiza la peticion a:

```text
POST http://localhost:3001/api/users/login
```

## Login

El frontend envia este formato:

```json
{
  "identificador": "usuario_o_correo",
  "contraseña": "tu_contraseña"
}
```

El backend busca el valor recibido en las columnas `usuario` y `email`. Respuestas principales:

- `200`: credenciales validas.
- `400`: faltan el identificador o la contrasena.
- `401`: usuario, correo o contrasena incorrectos.
- `500`: error interno o de conexion con MySQL.

## Endpoints de usuarios

La API se monta bajo `/api/users`:

| Metodo | Ruta | Funcion |
| --- | --- | --- |
| POST | `/api/users` | Crear usuario |
| POST | `/api/users/login` | Iniciar sesion |
| GET | `/api/users` | Consultar usuarios |
| GET | `/api/users/:id` | Consultar usuario por ID |
| PUT | `/api/users/:id` | Actualizar usuario |
| PATCH | `/api/users/:id` | Actualizacion parcial |
| DELETE | `/api/users/:id` | Eliminar usuario |
| GET | `/health` | Verificar disponibilidad del backend |

## Pruebas

Ejecuta las pruebas desde `SIGEPOR_BACKEND`:

```bash
npm test
```

Tambien se verifico manualmente que:

- El backend inicia con la configuracion de MySQL disponible.
- La ruta `/api/users/login` responde `400` cuando faltan datos.
- Las credenciales invalidas responden `401`.
- La consulta de login busca por usuario o correo.
- El proyecto no presenta errores de sintaxis en los archivos principales del flujo de autenticacion.

## Pendientes recomendados

- Aplicar `bcrypt` al crear y actualizar contrasenas; el flujo actual compara el valor almacenado y debe migrarse completamente a hashes.
- Agregar tokens o sesiones para proteger los endpoints privados.
- Evitar guardar informacion de autenticacion sensible en `localStorage`.
- Separar la logica inline de `index.html` en un modulo JavaScript unico.
- Agregar pruebas de integracion para login valido, login por usuario, login por correo y credenciales invalidas.
- Completar las vistas de reportes y configuracion.

## Documentacion adicional

- [Documentacion del backend](SIGEPOR_BACKEND/README.md)
- [Arquitectura SQL visual](frontend/assets/ARQUITECTURA_SQL.html)
- [Resumen de mejoras visuales](frontend/assets/RESUMEN_MEJORAS.html)
- [Ejemplos de imagenes](frontend/assets/EJEMPLOS_IMAGENES.html)
- [Prueba de logos](frontend/assets/PRUEBA_LOGOS.html)

##actualizacion 20sep2026 
1. Núcleo del Motor Offline (frontend/assets/js/offline_sync.js)
Procesamiento de Cola Saliente (processOfflineQueue): Al reconectarse a Internet o al backend, recorre la cola sigepor_offline_queue enviando secuencialmente a la API MySQL cada solicitud pendiente (POST, PUT, DELETE).
Sincronización Entrante y Refresco Global (refrescarUIActual): Al finalizar la sincronización saliente o detectar conexión activa, dispara la recarga de la UI y los arreglos de memoria de la página en uso.
Insignia de Red Flotante (renderSyncBadge): Notifica en tiempo real el estado actual (🟢 En línea, 🟠 Modo Offline (X guardados localmente), ⚡ X pendientes por sincronizar, 🔄 Sincronizando...) e incluye botón "Sincronizar Ya".
Helper fetchConFallbackOffline: Permite realizar solicitudes de mutación transparentes, encolando automáticamente si la red falla o está fuera de línea.
2. Módulos Integrados
🐷 Módulo de Porcinos (
registro_porcino.js
)
Lectura híbrida en cargarPorcinos(): Carga desde MySQL cuando hay conexión y actualiza el caché sigeporPigs. Si falla la red, lee directamente de sigeporPigs.
Registro (POST), edición (PUT) y eliminación (DELETE) con actualización optimista inmediata de la tabla y estadísticas, registrando cambios en la cola offline si no hay señal.
Caché local de veterinarios (sigepor_cache_veterinarios) para autocompletar el selector sin red.
🩺 Módulo de Vacunas (
vacunas.html
)
Inclusión del script offline_sync.js.
Registro y eliminación sincronizados con sigeporVaccines en localStorage.
Recálculo de estadísticas locales (Total, Aplicadas, Pendientes) a partir del caché local cuando el servidor no responde.
📦 Módulo de Inventario (
inventario.js
)
Sincronización de stock de alimento balanceado mediante el caché sigeporInventario.
Operaciones de adición y eliminación con fallback offline y actualización de tarjetas de total en kilos.
🍼 Módulo de Eventos Reproductivos (
reproduccion.js
)
Almacenamiento en caché de eventos reproductivos (sigeporReproduccion).
Registro offline de cubriciones, partos (con lechones nacidos) y destetes, recalculando contadores en pantalla.
👨‍⚕️ Módulo de Veterinarios (
veterinarios.html
)
Integración de offline_sync.js.
Registro, consulta por ID, actualización y eliminación de personal veterinario con respaldo en sigeporVeterinarios.
👤 Módulo de Usuarios (
registro_usuarios.html
)
Integración de offline_sync.js.
Guardado, búsqueda, edición y borrado de perfiles de usuario con fallback local en sigeporUsuarios.
📊 Módulo de Reportes & Trazabilidad (
reportes.js
)
cargarAlertasSistema(): En caso de no tener señal, genera alertas automáticas a partir de los datos en caché (sigeporPigs, sigeporVaccines, sigeporReproduccion).
exportarDatosModulo(): Permite descargar reportes CSV y JSON extraídos directamente de la memoria del navegador cuando el backend está inalcanzable.
buscarTrazabilidadPorcino(): Consulta e imprime la ficha técnica e historial productivo buscando en la base local si no hay conexión a MySQL.