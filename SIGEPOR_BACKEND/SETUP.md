# 🔧 Setup e Instalación - SIGEPOR Backend

## Requisitos Previos

- **Node.js** v16 o superior (ver versión con `node -v`)
- **MySQL** v5.7 o superior
- **npm** (viene con Node.js)

---

## 🚀 Instalación Paso a Paso

### 1. Clonar o descargar el proyecto

```bash
cd tu-directorio
git clone <url-del-repo>
cd SIGEPOR_BACKEND
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo .env

Copiar `.env.example` a `.env` con valores reales:

```bash
cp .env.example .env
```

Editar `.env` con tus valores (nota: usar valores locales para desarrollo):

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root              # ← Cambiar por tu usuario de MySQL
DB_PASSWORD=tu_password   # ← Cambiar por tu contraseña
DB_NAME=sigepor_db        # ← Nombre de la BD a crear
```

### 4. Crear Base de Datos en MySQL

**Opción A: Desde terminal (Linux/Mac/PowerShell)**

```bash
# Conectar a MySQL
mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE sigepor_db;
EXIT
```

**Opción B: Con MySQL Workbench**

1. Abre MySQL Workbench
2. Click en `+` para nueva conexión
3. Completa los datos
4. Ejecuta: `CREATE DATABASE sigepor_db;`

### 5. Ejecutar Schema (crear tablas)

```bash
# Desde la terminal, en la carpeta del proyecto:
mysql -u root -p sigepor_db < src/config/database.schema.sql
```

**O manualmente en MySQL:**

```sql
USE sigepor_db;
-- Pega el contenido de src/config/database.schema.sql aquí
-- y ejecuta
```

### 6. Verificar instalación

```bash
# Ver si las tablas se crearon
mysql -u root -p sigepor_db
> SHOW TABLES;
> SELECT * FROM roles;
> EXIT
```

Deberías ver algo como:

```
Tables_in_sigepor_db
roles
users
```

---

## ▶️ Iniciar el servidor

**Desarrollo (con auto-reload):**

```bash
npm run dev
```

**Producción:**

```bash
npm start
```

Deberías ver:

```
🔄 Connecting to MySQL...
✓ MySQL connected successfully
🚀 SIGEPOR backend running on port 3000
```

---

## ✅ Probar la API

### Health Check

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "SIGEPOR backend is running"
}
```

### Crear Usuario

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "contraseña": "MiContraseña123",
    "idRol": 2
  }'
```

Respuesta esperada (201 Created):

```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "id_rol": 2
  }
}
```

---

## 🧪 Ejecutar Pruebas

```bash
npm test
```

---

## 📋 Troubleshooting

### Error: "Can't connect to MySQL server"

- ✅ Verificar que MySQL está corriendo: `mysql -u root -p` (debe conectar)
- ✅ Verificar valores en `.env` (host, usuario, contraseña)
- ✅ Verificar que la BD existe: `mysql -u root -p -e "SHOW DATABASES;"`

### Error: "Table 'sigepor_db.users' doesn't exist"

- ✅ Ejecutar el schema: `mysql -u root -p sigepor_db < src/config/database.schema.sql`
- ✅ Verificar que se creó: `mysql -u root -p sigepor_db -e "SHOW TABLES;"`

### Error: "Unknown database"

- ✅ Crear la BD: `mysql -u root -p -e "CREATE DATABASE sigepor_db;"`

### Puerto 3000 ya está en uso

Cambiar en `.env`:

```env
PORT=3001  # ← O cualquier otro puerto libre
```

---

## 📚 Recursos Útiles

- [Documentación Express](https://expressjs.com/)
- [Documentación MySQL2](https://www.npmjs.com/package/mysql2)
- [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [Postman Collection](./POSTMAN_README.md)

---

## 💡 Notas Importantes

- ⚠️ Nunca hacer push del archivo `.env` (contiene credenciales)
- ✅ Usar `.env.example` como plantilla para nuevos devs
- ✅ Las contraseñas se almacenan cifradas con bcryptjs
- ✅ Los IDs de roles deben existir en la tabla `roles`
