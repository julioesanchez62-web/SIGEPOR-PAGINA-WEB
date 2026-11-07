# 🧪 Colección de Pruebas Postman - API Usuarios

## 📋 Descripción

Colección QA completa para el endpoint `POST /api/users` del backend SIGEPOR.

**Incluye 27 casos de prueba:**
- ✅ 1 caso de creación exitosa (Happy Path)
- ❌ 22 casos de validación (Validator)
- ❌ 2 casos de reglas de negocio (Service)
- ❌ 2 casos de errores de sistema (Repository/MySQL)

---

## 📥 Importación en Postman

### Opción 1: Desde el archivo (Recomendado)

1. Abre **Postman**
2. Click en **File** → **Import**
3. Selecciona `postman-collection.json`
4. Click en **Import**

### Opción 2: Desde URL (si está en repositorio)

1. Click en **Import**
2. Pega la URL del archivo JSON
3. Click en **Import**

---

## ⚙️ Configuración

### Variable de Entorno: BASE_URL

La colección usa variable `{{BASE_URL}}` que por defecto es:

```
http://localhost:3000
```

**Para cambiar:**

1. Click en **Environments** (ojo 👁️ en esquina superior derecha)
2. Crea nuevo o edita existente
3. Añade:
   ```
   KEY: BASE_URL
   VALUE: http://tu-servidor:puerto
   ```
4. Selecciona el environment activo

---

## 🚀 Ejecución de Pruebas

### Ejecutar un caso individual

1. Click en la prueba
2. Click en **Send**
3. Ver respuesta en **Response**

### Ejecutar toda la colección (Collection Runner)

1. Click en **Collection Runner** (flecha junto a colecciones)
2. Selecciona "SIGEPOR Backend - API Usuarios"
3. Click en **Run** (o **Run with Delays**)
4. Ver resultados

### Orden recomendado de ejecución:

```
Fase 1: Validaciones (rápidas, sin prequisitos)
├─ Casos 2-23 (todos los 400 Bad Request)
└─ Duración: ~1 minuto

Fase 2: Negocio (requieren prequisitos en BD)
├─ Casos 24-25 (409 y 404)
├─ Prequisito: Rol id=1 debe existir
├─ Prequisito caso 24: Usuario con correo "existente@example.com"
└─ Duración: ~10 segundos

Fase 3: Sistema (requieren ambiente especial)
├─ Casos 26-27 (500 Internal Server Error)
├─ Caso 26: Apagar MySQL
├─ Caso 27: Eliminar tabla 'users'
└─ Duración: ~5 segundos

Fase 4: Happy Path (último, confirma todo funciona)
├─ Casos 1, 15, 23 (201 Created)
├─ Prequisito: Rol id=1 y id=2 deben existir
└─ Duración: ~10 segundos
```

---

## 📊 Estructura de Casos

Cada caso tiene:

- **Nombre descriptivo** con número y categoría
- **URL:** `{{BASE_URL}}/api/users`
- **Método:** POST
- **Body JSON** con datos de prueba
- **Descripción completa** (ver en tab "Description")

### Información en Descripción

```
[Emoji] CASO X: Descripción breve

**Status esperado:** HTTP status code
**Mensaje esperado:** Texto exacto del error
**Capa donde se detiene:** Validator/Service/Repository
**Razón:** Motivo técnico de la falla

**Prequisitos:** Datos necesarios en BD
**Postcondiciones:** Estado después de prueba
```

---

## 🔍 Lectura de Respuestas

### Respuesta Exitosa (201 Created)

```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 5,
    "nombre": "Juan Pérez García",
    "correo": "juan.perez@empresa.com",
    "id_rol": 1
  }
}
```

**Nota:** La contraseña NUNCA debe aparecer en la respuesta

### Respuesta de Error (4xx)

```json
{
  "message": "El correo no tiene formato válido"
}
```

**Nota:** No incluye stack trace (seguridad)

### Respuesta Error Interno (500)

**En Postman:**
```json
{
  "message": "Error interno del servidor. Por favor, intenta más tarde."
}
```

**En terminal/logs:** Stack trace completo

---

## 📋 Prequisitos de Base de Datos

Antes de ejecutar pruebas, asegurate de:

### 1. Base de datos existe
```sql
CREATE DATABASE sigepor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigepor_db;
```

### 2. Tabla roles existe
```sql
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

### 3. Tabla users existe
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contraseña_hash VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id)
) ENGINE=InnoDB;
```

### 4. Roles necesarios (para casos exitosos)
```sql
INSERT INTO roles (nombre, descripcion) VALUES 
('Admin', 'Administrador del sistema'),
('Usuario', 'Usuario estándar');
```

### 5. Usuario existente (para caso 24 - correo duplicado)
```sql
INSERT INTO users (nombre, correo, contraseña_hash, id_rol) VALUES
('Usuario Existente', 'existente@example.com', '$2b$10$...(hash cualquiera)', 1);
```

---

## 🧪 Interpretación de Resultados

### VERDE ✅ = Esperado

```
Status: 201 Created
Response: { "message": "Usuario creado exitosamente", ... }
```

### ROJO ❌ = Esperado (Error intencional)

```
Status: 400 Bad Request
Response: { "message": "El correo no tiene formato válido" }
```

### ROJO ❌ = INESPERADO (Falla real)

```
Status: 500 Internal Server Error
Response: (sin detalles por seguridad)
Terminal: Stack trace = problema real
```

---

## 🐛 Debugging

### Si un caso falla inesperadamente:

1. **Abre Developer Tools** (F12 en Postman)
2. **Revisa Console** para errores JavaScript
3. **Abre Network** para ver request/response completos
4. **Revisa terminal del servidor**
   ```
   npm run dev
   # o
   node src/server.js
   ```

### Errores comunes:

| Error | Causa | Solución |
|-------|-------|----------|
| `connect ECONNREFUSED` | MySQL caído | `mysql -u root -p` |
| `Table doesn't exist` | Tablas no creadas | Ejecutar SQL de setup |
| `Unknown column` | Schema desactualizado | Recrea tablas |
| `Access denied` | Credenciales MySQL | Revisa .env |

---

## 📊 Estadísticas de Cobertura

| Categoría | Casos | Cobertura |
|-----------|-------|-----------|
| **Validación** | 22 | Nombre (4), Correo (6), Contraseña (4), IDRol (8) |
| **Negocio** | 2 | Correo duplicado, Rol no existe |
| **Sistema** | 2 | MySQL down, Tabla no existe |
| **Happy Path** | 1 | Creación exitosa |
| **TOTAL** | **27** | **100%** |

---

## 💡 Tips de Uso

### 1. Usar Postman Tests

Puedes añadir tests a cada request:

```javascript
pm.test("Status es 400", () => {
  pm.expect(pm.response.code).to.equal(400);
});

pm.test("Mensaje contiene 'obligatorio'", () => {
  pm.expect(pm.response.text()).to.include("obligatorio");
});
```

### 2. Guardar variables entre requests

```javascript
// En éxito, guardar ID:
let jsonData = pm.response.json();
pm.environment.set("usuarioId", jsonData.user.id);
```

### 3. Exportar resultados

Collection Runner → **Export Results** (JSON o CSV)

### 4. CI/CD Integration

```bash
# Ejecutar con Newman (CLI de Postman)
npm install -g newman

newman run postman-collection.json \
  --environment environment.json \
  --reporters cli,json
```

---

## 📧 Contacto / Soporte

Si encuentras problemas:

1. Revisa logs en terminal
2. Verifica configuración de BD
3. Consulta documentación de cada endpoint en la descripción
4. Ejecuta orden recomendado de pruebas

---

## ✅ Checklist Antes de Liberar a Producción

```
□ Todos los 27 casos de prueba PASAN
□ Casos 1, 15, 23 dan 201 Created
□ Casos 2-23 dan 400 Bad Request con mensaje correcto
□ Caso 24 da 409 Conflict
□ Caso 25 da 404 Not Found
□ Contraseña NUNCA se retorna en respuestas
□ Errores 500 no muestran stack trace
□ BD tiene índices en correo (UNIQUE)
□ BD tiene foreign key en id_rol
□ Variables {{BASE_URL}} configuradas
□ Logs de errores se registran correctamente
```

---

Última actualización: 2026-08-13
