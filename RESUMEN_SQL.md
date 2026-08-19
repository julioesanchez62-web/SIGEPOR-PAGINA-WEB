# 📚 RESUMEN: CONEXIÓN DEL PROYECTO CON SQL

## ✅ Lo Que Se Ha Hecho

### 1. **Backend Node.js + Express** ✓
Archivo: `server.js`
- Servidor REST API
- Conexión a MySQL
- Autenticación con JWT
- Hash de contraseñas con bcrypt
- CORS habilitado

### 2. **Base de Datos MySQL** ✓
Archivo: `database.sql`
- Tabla `veterinarios` - Registro de usuarios
- Tabla `vacunaciones` - Registro de vacunas
- Tabla `porcinos` - Registro de animales
- Tabla `logs_actividad` - Auditoría

### 3. **Frontend Actualizado** ✓
- `registro_veterinarios.html` - Conectado a APIs
- `vacunas.html` - Conectado a APIs
- Autenticación con tokens JWT

### 4. **Configuración** ✓
- `package.json` - Dependencias Node.js
- `.env` - Variables de entorno
- Documentación completa

---

## 🔌 ARQUITECTURA DE CONEXIÓN

```
┌─────────────────────────────────────────────┐
│  NAVEGADOR (HTML + JavaScript)              │
│  - index.html                               │
│  - registro_veterinarios.html               │
│  - vacunas.html                             │
└────────────┬────────────────────────────────┘
             │ (HTTPS/API REST)
             │
┌────────────▼────────────────────────────────┐
│  SERVIDOR NODE.JS (Express)                 │
│  - server.js                                │
│  - Puerto: 3001                             │
│  - Endpoints: /api/veterinarios/*           │
│  -           /api/vacunas/*                 │
│  -           /api/porcinos/*                │
└────────────┬────────────────────────────────┘
             │ (mysql2/promise)
             │
┌────────────▼────────────────────────────────┐
│  BASE DE DATOS MySQL                        │
│  - BD: sigepor                              │
│  - Host: localhost:3306                     │
│  - Tablas: veterinarios, vacunaciones, etc  │
└─────────────────────────────────────────────┘
```

---

## 🚀 PASOS PARA USAR

### PASO 1: Configurar MySQL
```bash
# Opción A: MySQL Workbench
- Abre MySQL Workbench
- Ejecuta el contenido de database.sql

# Opción B: Línea de comandos
mysql -u root -p < database.sql
```

### PASO 2: Configurar Backend
```bash
# Navega a la carpeta del proyecto
cd "C:\Users\julio\OneDrive\Desktop\SIGEPOR PAGINA WEB"

# Instala dependencias
npm install

# Edita .env si es necesario (credenciales MySQL)

# Inicia el servidor
npm start
```

Deberías ver:
```
✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
📊 Base de datos conectada a MySQL
```

### PASO 3: Usar la Aplicación
- Abre `index.html` en navegador
- Haz clic en **"👨‍⚕️ VETERINARIOS"**
- Regístrate e inicia sesión
- Gestiona vacunas

---

## 📊 FLUJO DE DATOS

### Registro de Veterinario

```
Usuario ingresa datos en formulario
         ↓
Validación en navegador (contraseña, email)
         ↓
POST /api/veterinarios/registrar
         ↓
Servidor valida datos
         ↓
Hash contraseña con bcrypt
         ↓
INSERT en tabla veterinarios
         ↓
Respuesta: ✓ Registrado
         ↓
Usuario redirigido a login
```

### Login de Veterinario

```
Usuario ingresa usuario + contraseña
         ↓
POST /api/veterinarios/login
         ↓
Servidor busca usuario en BD
         ↓
Compara contraseña hasheada
         ↓
Si válido: Genera JWT
         ↓
localStorage: token + datos veterinario
         ↓
Redirige a vacunas.html
```

### Crear Vacunación

```
Usuario rellena formulario de vacuna
         ↓
POST /api/vacunas (con token JWT)
         ↓
Servidor verifica token
         ↓
Valida datos
         ↓
INSERT en tabla vacunaciones
         ↓
GET /api/vacunas (recarga tabla)
         ↓
Muestra vacuna en tabla HTML
```

---

## 🔐 SEGURIDAD IMPLEMENTADA

✅ **Hash de contraseñas** - bcryptjs
✅ **Tokens JWT** - Autenticación stateless
✅ **CORS** - Control de orígenes
✅ **Validación de entrada** - Servidor y cliente
✅ **Relaciones Foreign Key** - Integridad referencial
✅ **Índices en BD** - Optimización

---

## 📁 ARCHIVOS NUEVOS CREADOS

```
SIGEPOR PAGINA WEB/
├── server.js                    # Backend Node.js/Express
├── package.json                 # Dependencias
├── .env                        # Variables de entorno
├── database.sql                # Script SQL para crear BD
├── INSTALACION_SQL.md          # Guía de instalación
├── PRUEBA_RAPIDA.md            # Guía de pruebas
└── RESUMEN_SQL.md              # Este archivo
```

---

## 🔄 ENDPOINTS API DISPONIBLES

### Veterinarios
- `POST /api/veterinarios/registrar` - Registrar nuevo
- `POST /api/veterinarios/login` - Iniciar sesión
- `GET /api/veterinarios/perfil` - Obtener perfil (requiere token)

### Vacunaciones
- `POST /api/vacunas` - Crear vacunación (requiere token)
- `GET /api/vacunas` - Obtener todas (requiere token)
- `GET /api/vacunas/:id` - Obtener una (requiere token)
- `PUT /api/vacunas/:id` - Actualizar (requiere token)
- `DELETE /api/vacunas/:id` - Eliminar (requiere token)
- `GET /api/vacunas/estadisticas/resumen` - Estadísticas (requiere token)

### Porcinos
- `POST /api/porcinos` - Crear porcino (requiere token)
- `GET /api/porcinos` - Obtener todos (requiere token)

---

## ⚙️ VARIABLES DE ENTORNO (.env)

```env
PORT=3001                    # Puerto del servidor
NODE_ENV=development         # Ambiente

# Credenciales MySQL
DB_HOST=localhost           # Host de MySQL
DB_USER=root                # Usuario MySQL
DB_PASSWORD=                # Contraseña (vacío si no tiene)
DB_NAME=sigepor             # Nombre BD

# Seguridad
JWT_SECRET=tu_clave_secreta # Cambiar en producción
```

---

## 🧪 USUARIOS DE PRUEBA

Después de ejecutar `database.sql`, intenta:

```
Usuario: vet_prueba
Contraseña: prueba123
```

O crea tu propio usuario registrándote.

---

## 📊 ESTRUCTURA DE DATOS

### Tabla veterinarios
```
id (int) - Clave primaria
nombre (varchar) - Nombre del vet
email (varchar) - Email único
usuario (varchar) - Usuario único
contraseña (varchar) - Contraseña hasheada
fecha_registro (timestamp) - Cuándo se registró
activo (boolean) - Estado de cuenta
```

### Tabla vacunaciones
```
id (int) - Clave primaria
veterinario_id (int) - FK a veterinarios
porcino_id (varchar) - ID del porcino
nombre_vacuna (varchar) - Nombre
fecha_aplicacion (date) - Cuándo se aplicó
estado (varchar) - Aplicada/Pendiente/Retrasada
dosis (decimal) - Cantidad en ml
proxima_vacuna_dias (int) - Días para siguiente
notas (text) - Observaciones
fecha_registro (timestamp) - Fecha registro
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

| Error | Causa | Solución |
|-------|-------|----------|
| `ECONNREFUSED` | MySQL no corre | Inicia MySQL |
| `Access denied` | Credenciales incorrectas | Verifica `.env` |
| `CORS error` | Servidor no accesible | Verifica http://localhost:3001 |
| `Module not found` | Dependencias faltantes | `npm install` |
| `Connection pool error` | Muchas conexiones | Reinicia servidor |

---

## ✅ CHECKLIST FINAL

- [ ] MySQL instalado y ejecutándose
- [ ] Base de datos `sigepor` creada
- [ ] `npm install` completado
- [ ] `.env` configurado
- [ ] Servidor ejecutándose en puerto 3001
- [ ] Registro de veterinario funcionando
- [ ] Login funcionando
- [ ] Crear vacunas funcionando
- [ ] Obtener vacunas funcionando
- [ ] Eliminar vacunas funcionando

---

## 📚 DOCUMENTACIÓN COMPLETA

Lee estos archivos para más detalles:

1. **INSTALACION_SQL.md** - Guía paso a paso de instalación
2. **PRUEBA_RAPIDA.md** - Pasos para probar el sistema
3. **GUIA_VETERINARIOS.md** - Características del sistema

---

## 🎯 PRÓXIMOS PASOS OPCIONALES

- [ ] Agregar funcionalidad de editar vacunaciones
- [ ] Implementar recuperación de contraseña
- [ ] Exportar reportes en PDF
- [ ] Agregar panel de administrador
- [ ] Autenticación de 2 factores
- [ ] Integrar con servicio de email

---

**¡Sistema conectado y listo para usar! 🎉**

Para empezar:
```bash
npm start
```

Luego abre `index.html` en tu navegador.
