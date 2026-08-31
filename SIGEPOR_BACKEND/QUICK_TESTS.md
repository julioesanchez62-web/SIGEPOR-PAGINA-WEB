# 🧪 Guía de Pruebas Rápidas - SIGEPOR Backend

Una vez completada la instalación, usa esta guía para validar que todo funciona.

---

## ✅ Checklist Pre-Pruebas

- [ ] `.env` creado con valores correctos
- [ ] Base de datos `sigepor_db` creada
- [ ] Schema ejecutado: `mysql -u root -p sigepor_db < src/config/database.schema.sql`
- [ ] `npm install` completado
- [ ] `npm run dev` ejecutándose (el servidor debe estar levantado)

---

## 🚀 Pruebas Rápidas

### 1. Health Check (Verificar servidor está corriendo)

**Comando:**
```bash
curl http://localhost:3000/health
```

**Respuesta esperada (200):**
```json
{
  "status": "ok",
  "message": "SIGEPOR backend is running"
}
```

✅ Si ves esto: **El servidor está funcionando**

---

### 2. Crear Usuario (Happy Path - Caso Exitoso)

**Comando:**
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

**Respuesta esperada (201 Created):**
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

✅ Si ves esto: **El flujo completo (validator → controller → service → repository) funciona**

---

### 3. Validación: Email Inválido (Error 400)

**Comando:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "email-sin-arroba.com",
    "contraseña": "MiContraseña123",
    "idRol": 2
  }'
```

**Respuesta esperada (400):**
```json
{
  "message": "El correo no tiene formato válido"
}
```

✅ Si ves esto: **El validador está funcionando**

---

### 4. Validación: Contraseña Muy Corta (Error 400)

**Comando:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "contraseña": "123",
    "idRol": 2
  }'
```

**Respuesta esperada (400):**
```json
{
  "message": "La contraseña debe tener mínimo 6 caracteres"
}
```

✅ Si ves esto: **La validación de contraseña funciona**

---

### 5. Validación: Rol Inválido (Error 404)

**Comando:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "juan2@example.com",
    "contraseña": "MiContraseña123",
    "idRol": 999
  }'
```

**Respuesta esperada (404):**
```json
{
  "message": "El rol especificado no existe"
}
```

✅ Si ves esto: **La validación de negocio (rol) funciona**

---

### 6. Validación: Email Duplicado (Error 409)

**Comando (ejecutar después de la prueba #2):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Otro Nombre",
    "correo": "juan@example.com",
    "contraseña": "OtraContraseña123",
    "idRol": 2
  }'
```

**Respuesta esperada (409):**
```json
{
  "message": "El correo ya está registrado"
}
```

✅ Si ves esto: **La validación de unicidad de email funciona**

---

## 🔍 Verificar Base de Datos

Abre MySQL y ejecuta:

```sql
USE sigepor_db;

-- Ver usuarios creados
SELECT id, nombre, correo, id_rol FROM users;

-- Ver roles disponibles
SELECT * FROM roles;
```

**Deberías ver:**

**Tabla users:**
```
+----+-------------+------------------+--------+
| id | nombre      | correo           | id_rol |
+----+-------------+------------------+--------+
|  1 | Juan Pérez  | juan@example.com |      2 |
+----+-------------+------------------+--------+
```

**Tabla roles:**
```
+----+-----------+-------------------------------------------+
| id | nombre    | descripcion                               |
+----+-----------+-------------------------------------------+
|  1 | ADMIN     | Administrador del sistema con acceso total|
|  2 | USER      | Usuario estándar con acceso limitado      |
|  3 | MODERATOR | Moderador con acceso intermedio           |
+----+-----------+-------------------------------------------+
```

✅ Si ves esto: **La base de datos está funcionando correctamente**

---

## 🏃 Ejecutar Tests Automatizados

```bash
npm test
```

**Salida esperada:**
```
✓ GET /health returns ok status
Tests: 1 passed
```

✅ Si ves esto: **Los tests están funcionando**

---

## 🛠️ Troubleshooting Rápido

### ❌ Error: "connect ECONNREFUSED 127.0.0.1:3306"

**Significa:** MySQL no está corriendo

**Solución:**
```bash
# En Windows (PowerShell como Admin):
net start MySQL80

# En Mac:
brew services start mysql

# En Linux:
sudo service mysql start
```

---

### ❌ Error: "Unknown database 'sigepor_db'"

**Significa:** La BD no existe o no fue creada

**Solución:**
```bash
# Crear BD
mysql -u root -p -e "CREATE DATABASE sigepor_db;"

# Ejecutar schema
mysql -u root -p sigepor_db < src/config/database.schema.sql
```

---

### ❌ Error: "Table 'sigepor_db.users' doesn't exist"

**Significa:** El schema no se ejecutó correctamente

**Solución:**
```bash
# Eliminar y recrear
mysql -u root -p -e "DROP DATABASE sigepor_db; CREATE DATABASE sigepor_db;"

# Ejecutar schema nuevamente
mysql -u root -p sigepor_db < src/config/database.schema.sql
```

---

### ❌ Error: "POST /api/users" retorna 404

**Significa:** Las rutas no se registraron correctamente

**Solución:**
```bash
# Verificar que el servidor se inició correctamente
# Debes ver en consola:
# 🔄 Connecting to MySQL...
# ✓ MySQL connected successfully
# 🚀 SIGEPOR backend running on port 3000
```

---

### ❌ Contraseña del usuario creado se ve rara o no coincide

**Nota:** Las contraseñas se almacenan **cifradas** con bcryptjs.  
Esto es **normal y correcto** por seguridad.

El usuario `juan@example.com` nunca podrá ser consultado directamente con contraseña.

---

## 📊 Matriz de Respuestas Esperadas

| Endpoint | Método | Caso | Status | Significado |
|----------|--------|------|--------|-------------|
| /health | GET | OK | 200 | Servidor funciona |
| /api/users | POST | Creación exitosa | 201 | Usuario creado |
| /api/users | POST | Email inválido | 400 | Validación falla |
| /api/users | POST | Contraseña corta | 400 | Validación falla |
| /api/users | POST | Rol no existe | 404 | Negocio falla |
| /api/users | POST | Email duplicado | 409 | Negocio falla |

---

## ✨ Indicadores de Éxito

✅ Todos estos items deben pasar:

- [ ] Health check retorna 200
- [ ] Crear usuario retorna 201 con datos del usuario
- [ ] Email inválido retorna 400
- [ ] Contraseña corta retorna 400
- [ ] Rol inválido retorna 404
- [ ] Email duplicado retorna 409
- [ ] BD contiene usuario creado
- [ ] Tests automatizados pasan
- [ ] Rol aparece en tabla roles
- [ ] Contraseña se ve cifrada en BD

---

## 💡 Tips

- **Usa Postman:** Es más fácil que curl para pruebas. Ver [POSTMAN_README.md](./POSTMAN_README.md)
- **Reinicia servidor:** Si cambias código, presiona Ctrl+C y `npm run dev` nuevamente
- **Logs SQL:** Para ver queries, agrega console.log en repository.js
- **Valida JSON:** Asegúrate de que el JSON sea válido (sin comas extra)

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué la contraseña se ve así en la BD?**  
R: Está cifrada con bcryptjs. Es **normal y correcto**. Las contraseñas nunca deben estar en texto plano.

**P: ¿Puedo ver la contraseña del usuario creado?**  
R: No, y eso es **correcto**. La API nunca retorna contraseñas.

**P: ¿Qué otros usuarios puedo crear?**  
R: Los roles disponibles son: 1 (ADMIN), 2 (USER), 3 (MODERATOR)

**P: ¿Cómo puedo agregar más roles?**  
R: En MySQL: `INSERT INTO roles (nombre, descripcion) VALUES ('NUEVO_ROL', 'Descripción');`

---

Cuando todas estas pruebas pasen, ¡tu backend está completamente funcional! 🎉
