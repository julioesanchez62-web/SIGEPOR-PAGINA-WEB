# 🚀 Guía de Instalación y Configuración - SIGEPOR con MySQL

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** (v14 o superior) - [Descargar](https://nodejs.org/)
- ✅ **MySQL** o **MySQL Workbench** - [Descargar](https://dev.mysql.com/downloads/mysql/)
- ✅ **Git** (opcional) - [Descargar](https://git-scm.com/)

---

## 1️⃣ Configurar la Base de Datos MySQL

### Opción A: Usando MySQL Workbench

1. **Abre MySQL Workbench**
2. Conecta a tu servidor MySQL (generalmente `localhost:3306`)
3. Abre un nuevo SQL Script: `File > New Query Tab`
4. Copia todo el contenido de **`database.sql`** del proyecto
5. Ejecuta el script (Ctrl + Shift + Enter o el botón de ejecutar)
6. Deberías ver las tablas creadas en la base de datos `sigepor`

### Opción B: Línea de Comandos

```bash
mysql -u root -p < database.sql
```

Luego ingresa tu contraseña de MySQL.

---

## 2️⃣ Configurar el Backend Node.js

### Paso 1: Instalar Dependencias

```bash
cd "C:\Users\julio\OneDrive\Desktop\SIGEPOR PAGINA WEB"
npm install
```

Esto instalará:
- `express` - Framework web
- `mysql2` - Conector MySQL
- `cors` - Permitir peticiones cruzadas
- `bcryptjs` - Hash de contraseñas
- `jsonwebtoken` - Autenticación JWT
- `dotenv` - Variables de entorno

### Paso 2: Configurar Variables de Entorno

Edita el archivo **`.env`** con tus credenciales de MySQL:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=        # (déjalo vacío si no tiene contraseña)
DB_NAME=sigepor

JWT_SECRET=tu_clave_secreta_muy_segura_change_this_in_production
```

> **Nota:** Cambia `DB_PASSWORD` por tu contraseña de MySQL si la tienes.

### Paso 3: Iniciar el Servidor

```bash
npm start
```

O para desarrollo con reinicio automático:

```bash
npm run dev
```

Deberías ver:
```
✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
📊 Base de datos conectada a MySQL
```

---

## 3️⃣ Usar la Aplicación Web

### Abrir en el Navegador

1. **Abre `index.html`** en tu navegador (o simplemente abre el archivo)
2. Haz clic en **"👨‍⚕️ VETERINARIOS"**
3. Selecciona **"📝 Registrarse"** para crear una cuenta
4. Completa el formulario y luego **"Iniciar Sesión"**

### Rutas Principales

```
http://localhost:3001/ → Página de inicio
http://localhost:3001/registro_veterinarios.html → Login/Registro
http://localhost:3001/vacunas.html → Gestión de vacunas (protegida)
```

---

## 🔌 Endpoints API Disponibles

### Autenticación

```bash
# Registrar nuevo veterinario
POST /api/veterinarios/registrar
Content-Type: application/json
{
  "nombre": "Dr. Juan",
  "email": "juan@email.com",
  "usuario": "juan123",
  "contraseña": "password123"
}

# Iniciar sesión
POST /api/veterinarios/login
Content-Type: application/json
{
  "usuario": "juan123",
  "contraseña": "password123"
}
Respuesta:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "veterinario": { ... }
}

# Obtener perfil
GET /api/veterinarios/perfil
Authorization: Bearer <token>
```

### Vacunaciones

```bash
# Crear vacunación
POST /api/vacunas
Authorization: Bearer <token>
Content-Type: application/json
{
  "pigId": "P-001",
  "nombre": "Aujeszky",
  "fecha": "2026-05-24",
  "estado": "Aplicada",
  "dosis": 2.5,
  "proximaVacuna": 14,
  "notas": "Aplicada sin complicaciones"
}

# Obtener todas las vacunaciones
GET /api/vacunas
Authorization: Bearer <token>

# Obtener una vacunación
GET /api/vacunas/:id
Authorization: Bearer <token>

# Actualizar vacunación
PUT /api/vacunas/:id
Authorization: Bearer <token>

# Eliminar vacunación
DELETE /api/vacunas/:id
Authorization: Bearer <token>

# Estadísticas
GET /api/vacunas/estadisticas/resumen
Authorization: Bearer <token>
```

---

## 🐛 Solucionar Problemas

### Error: "Connection refused" o "Cannot connect to database"

**Problema:** MySQL no está ejecutándose o credenciales incorrectas

**Solución:**
1. Asegúrate que MySQL está iniciado (busca "Services" en Windows)
2. Verifica credenciales en `.env`
3. Prueba conectar desde MySQL Workbench

### Error: "CORS error" o "Not allowed by Access-Control-Allow-Origin"

**Problema:** La aplicación web no puede conectarse al servidor

**Solución:**
- Asegúrate que el servidor Node.js está ejecutándose en `http://localhost:3001`
- El archivo HTML debe estar en la misma carpeta que `server.js`

### Error: "Module not found: express"

**Problema:** Las dependencias no están instaladas

**Solución:**
```bash
npm install
```

### Error: "ERRCODE: 1045"

**Problema:** Usuario o contraseña de MySQL incorrecta

**Solución:**
1. Abre MySQL Workbench
2. Prueba conectar con tus credenciales
3. Actualiza `.env` con las credenciales correctas

---

## 📊 Estructura de Datos

### Tabla: veterinarios
```sql
id (INT, PK) - ID único
nombre (VARCHAR) - Nombre del veterinario
email (VARCHAR, UNIQUE) - Email único
usuario (VARCHAR, UNIQUE) - Usuario único
contraseña (VARCHAR) - Hash de contraseña
fecha_registro (TIMESTAMP) - Fecha de registro
activo (BOOLEAN) - Estado de la cuenta
```

### Tabla: vacunaciones
```sql
id (INT, PK) - ID único
veterinario_id (INT, FK) - Referencia al veterinario
porcino_id (VARCHAR) - ID del porcino
nombre_vacuna (VARCHAR) - Nombre de la vacuna
fecha_aplicacion (DATE) - Fecha de aplicación
estado (VARCHAR) - Aplicada/Pendiente/Retrasada
dosis (DECIMAL) - Cantidad en ml
proxima_vacuna_dias (INT) - Días para próxima vacuna
notas (TEXT) - Observaciones
fecha_registro (TIMESTAMP) - Fecha de registro
```

### Tabla: porcinos
```sql
id (INT, PK) - ID único
veterinario_id (INT, FK) - Referencia al veterinario
identificacion (VARCHAR) - ID del porcino
raza (VARCHAR) - Raza
peso (DECIMAL) - Peso en kg
estado_salud (VARCHAR) - Estado
fecha_nacimiento (DATE) - Fecha nacimiento
genero (VARCHAR) - Género
fecha_registro (TIMESTAMP) - Fecha de registro
```

---

## 🔐 Seguridad

✅ **Implementado:**
- Hash de contraseñas con bcrypt
- JWT para autenticación
- CORS habilitado
- Validaciones en servidor

⚠️ **Para Producción, implementar:**
- HTTPS obligatorio
- Variables de entorno seguras
- Rate limiting
- Validaciones más estrictas
- Logs de auditoría
- Copias de seguridad automáticas

---

## 📚 Archivos del Proyecto

```
SIGEPOR PAGINA WEB/
├── server.js                      # Backend Node.js/Express
├── package.json                   # Dependencias
├── .env                          # Variables de entorno
├── database.sql                   # Script de BD MySQL
├── index.html                     # Página de inicio
├── registro_veterinarios.html     # Login/Registro
├── vacunas.html                   # Gestión de vacunas
├── registroporcino.html           # Gestión de porcinos
├── style.css                      # Estilos
├── script.js                      # Scripts generales
└── INSTALACION_SQL.md             # Este archivo
```

---

## ✅ Checklist de Configuración

- [ ] MySQL instalado y ejecutándose
- [ ] Base de datos `sigepor` creada
- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Servidor Node.js ejecutándose (`npm start`)
- [ ] Navegador abierto en `index.html`
- [ ] Registro de veterinario exitoso
- [ ] Login funcionando
- [ ] Página de vacunas accesible

---

## 🎯 Próximos Pasos

1. **Agregar más veterinarios** - Registra múltiples cuentas
2. **Registrar porcinos** - Vincula porcinos a veterinarios
3. **Crear vacunaciones** - Registra las vacunas aplicadas
4. **Exportar reportes** - Genera reportes en PDF/Excel

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en la consola del navegador (F12)
2. Verifica los logs del servidor Node.js
3. Asegúrate que MySQL está ejecutándose
4. Verifica la configuración en `.env`

---

**¡Sistema listo para usar! 🎉**
