# 🆘 GUÍA DE SOLUCIÓN DE PROBLEMAS

## 🔴 Errores Comunes y Soluciones

### 1. "Cannot connect to database"

**Síntomas:**
```
Error: Connection timeout
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Posibles causas:**
- MySQL no está ejecutándose
- Credenciales incorrectas
- Puerto 3306 ocupado
- BD no existe

**Soluciones:**

```bash
# Verificar si MySQL está corriendo
mysql -u root -p

# Si falla, iniciar MySQL (Windows)
# Buscar "Services" en Windows
# Buscar "MySQL" y iniciar

# Verificar si BD existe
SHOW DATABASES;

# Verificar credenciales en .env
cat .env

# Si sigue sin funcionar, recrear BD
mysql -u root -p < database.sql
```

---

### 2. "CORS error" o "Access denied from origin"

**Síntomas:**
```
Access to XMLHttpRequest blocked by CORS policy
Cross-Origin Request Blocked
```

**Causa:** El navegador no puede conectarse al servidor

**Soluciones:**

```bash
# 1. Verificar que servidor está ejecutándose
npm start

# Debes ver:
# ✅ Servidor SIGEPOR ejecutándose en http://localhost:3001

# 2. Verificar puerto 3001 está disponible
netstat -an | findstr :3001

# 3. Si falla, cambiar puerto en .env
PORT=3002

# 4. Reiniciar servidor
npm start

# 5. En el HTML/JS, cambiar URL
const API_URL = 'http://localhost:3002/api';
```

---

### 3. "Module not found"

**Síntomas:**
```
Cannot find module 'express'
Error: Cannot find module 'mysql2'
```

**Causa:** Dependencias no instaladas

**Soluciones:**

```bash
# 1. Instalar todas las dependencias
npm install

# 2. Verificar que package.json existe
ls -la package.json

# 3. Limpiar y reinstalar
rm -rf node_modules
npm install

# 4. Verificar carpeta node_modules existe
ls node_modules | head
```

---

### 4. "Access denied for user 'root'@'localhost'"

**Síntomas:**
```
Error: ER_ACCESS_DENIED_FOR_USER: Access denied for user 'root'@'localhost'
```

**Causa:** Contraseña MySQL incorrecta

**Soluciones:**

```bash
# 1. Verificar contraseña en .env
cat .env

# 2. Probar conexión manual
mysql -u root -p

# 3. Si no recuerdas contraseña (Windows)
# Reiniciar MySQL sin contraseña
# O usar MySQL Installer para cambiarla

# 4. Actualizar .env
DB_PASSWORD=mi_nueva_contraseña

# 5. Reiniciar servidor
npm start
```

---

### 5. "Port 3001 already in use"

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Causa:** Otro proceso usando puerto 3001

**Soluciones:**

```bash
# 1. Cambiar puerto en .env
PORT=3002

# 2. O encontrar y matar el proceso (Windows)
netstat -ano | findstr :3001

# Resultado: TCP  0.0.0.0:3001  0.0.0.0:0  LISTENING  1234

# Matar el proceso (1234 es el PID)
taskkill /PID 1234 /F

# 3. Reiniciar servidor con nuevo puerto
npm start
```

---

### 6. "Cannot GET /api/veterinarios/login"

**Síntomas:**
```
404 Not Found
Cannot POST /api/veterinarios/registrar
```

**Causa:** Server.js no está ejecutándose o tiene errores

**Soluciones:**

```bash
# 1. Verificar que el servidor está ejecutándose
npm start

# 2. Revisar logs de error
# En la terminal donde ejecutaste npm start

# 3. Verificar que server.js está en la carpeta correcta
ls server.js

# 4. Si hay error de sintaxis, abrir server.js y revisar

# 5. Reiniciar con logs detallados
NODE_ENV=development npm start
```

---

### 7. "Database doesn't exist: sigepor"

**Síntomas:**
```
Error: ER_BAD_DB_ERROR: Unknown database 'sigepor'
```

**Causa:** database.sql no fue ejecutado

**Soluciones:**

```bash
# 1. Ejecutar script SQL
mysql -u root -p < database.sql

# 2. O en MySQL Workbench
# - Abre nueva Query Tab
# - Copia contenido de database.sql
# - Ejecuta (Ctrl + Shift + Enter)

# 3. Verificar que se creó
mysql -u root -p
SHOW DATABASES;
USE sigepor;
SHOW TABLES;
```

---

### 8. "ERR_CONNECTION_REFUSED"

**Síntomas:**
```
Cannot connect to http://localhost:3001
Este sitio no está disponible
```

**Causa:** Servidor no está ejecutándose

**Soluciones:**

```bash
# 1. Abrir terminal en carpeta del proyecto
cd "C:\Users\julio\OneDrive\Desktop\SIGEPOR PAGINA WEB"

# 2. Iniciar servidor
npm start

# 3. Esperar a ver:
# ✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
# 📊 Base de datos conectada a MySQL

# 4. Si no aparece ese mensaje, hay error
# Revisar mensajes de error en terminal
```

---

### 9. "JSON.parse() error" en consola

**Síntomas:**
```
Uncaught SyntaxError: Unexpected token '<' in JSON at position 0
```

**Causa:** El servidor devuelve HTML en lugar de JSON

**Soluciones:**

```bash
# 1. Verificar que la URL es correcta
# Debe ser: http://localhost:3001/api/...
# No: file:///C:/Users/...

# 2. Verificar que es GET o POST correcto
fetch('http://localhost:3001/api/veterinarios/login', {
  method: 'POST',  // ← Importante
  headers: { 'Content-Type': 'application/json' }
})

# 3. Verificar servidor está ejecutándose
npm start

# 4. Revisar Network tab en DevTools
# F12 → Network → Refresh → Ver request/response
```

---

### 10. "Token expired" o "Invalid token"

**Síntomas:**
```
Error: Token inválido
401 Unauthorized
```

**Causa:** Sesión expiró o token corrupto

**Soluciones:**

```javascript
// 1. Limpiar localStorage y reiniciar sesión
localStorage.removeItem('token');
localStorage.removeItem('veterinarioActivo');

// 2. Ir a página de login
window.location.href = 'registro_veterinarios.html';

// 3. Iniciar sesión de nuevo

// En producción:
// - Cambiar JWT_SECRET en .env
// - Aumentar expiración del token si es necesario
```

---

## 🔍 DIAGRAMA DE TROUBLESHOOTING

```
¿Hay error?
    │
    ├─→ "Cannot connect to database"
    │   └─→ ¿MySQL ejecutándose? 
    │       ├─ No → Inicia MySQL
    │       └─ Sí → Verifica .env
    │
    ├─→ "CORS error"
    │   └─→ ¿Servidor en http://localhost:3001?
    │       ├─ No → npm start
    │       └─ Sí → Verifica network tab
    │
    ├─→ "Module not found"
    │   └─→ ¿node_modules existe?
    │       ├─ No → npm install
    │       └─ Sí → npm install --force
    │
    ├─→ "404 Not Found"
    │   └─→ ¿Servidor ejecutándose?
    │       ├─ No → npm start
    │       └─ Sí → Verifica server.js
    │
    └─→ Otro error
        └─→ Busca en console (F12)
            ├─ Revisa network requests
            ├─ Busca mensajes de error
            └─ Intenta reproducir

✓ Error resuelto
```

---

## 🛠️ HERRAMIENTAS DE DEBUG

### Console del Navegador (F12)

```javascript
// Ver si hay errores
console.log('Conectando a servidor...');

// Ver requests
fetch('http://localhost:3001/api/veterinarios/login', {...})
  .then(r => console.log(r))
  .catch(e => console.error('Error:', e));
```

### Network Tab (F12 → Network)

```
1. Abre DevTools (F12)
2. Ve a pestaña "Network"
3. Intenta login
4. Ve si aparece request
5. Haz click en request
6. Ve Response
```

### Terminal del Servidor

```bash
# Ver logs en tiempo real
npm start

# Debes ver:
# - Conexión a BD
# - Cada request que llega
# - Errores de ejecución
```

### MySQL Workbench

```sql
-- Ver si datos se guardan
SELECT * FROM veterinarios;

-- Ver si hay error en BD
SHOW ENGINE INNODB STATUS;

-- Ver logs
SHOW VARIABLES LIKE 'log_error';
```

---

## 🚨 CHECKLIST CUANDO ALGO FALLA

- [ ] ¿MySQL está ejecutándose?
- [ ] ¿npm start sin errores?
- [ ] ¿Puerto 3001 disponible?
- [ ] ¿.env con credenciales correctas?
- [ ] ¿database.sql ejecutado?
- [ ] ¿Navegador muestra index.html?
- [ ] ¿Consola (F12) sin errores rojos?
- [ ] ¿Network tab muestra requests?
- [ ] ¿Respuestas son JSON (no HTML)?

---

## 📊 ESTADO DE SALUD - COMANDOS

```bash
# Verificar todo está bien

# 1. MySQL
mysql -u root -p -e "SHOW DATABASES;"

# 2. Node.js
npm start
# Debe aparecer:
# ✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
# 📊 Base de datos conectada a MySQL

# 3. Hacer una request de prueba
curl http://localhost:3001/

# 4. Verificar puerto
netstat -an | findstr 3001
```

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Puedo usar otro puerto?**
A: Sí, cambia PORT en .env y actualiza URLs en HTML

**P: ¿Puedo usar otra contraseña?**
A: Sí, set la nueva en .env DB_PASSWORD

**P: ¿Cómo veo los datos guardados?**
A: Abre MySQL Workbench y ve tabla "vacunaciones"

**P: ¿Se pierden datos si apago servidor?**
A: No, están en MySQL, solo apaguen el servidor

**P: ¿Puedo usar en otro PC?**
A: Sí, cambia localhost por IP del servidor en API_URL

---

## ✅ SOLUCIÓN VERIFICADA

Una vez que veas esto, todo está bien:

```
Terminal:
✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
📊 Base de datos conectada a MySQL

Navegador:
✅ index.html carga sin errores
✅ Botón "👨‍⚕️ VETERINARIOS" visible
✅ Página de registro abre
✅ Puedo registrarme
✅ Puedo iniciar sesión
✅ Página de vacunas carga
✅ Puedo crear vacunas
✅ Tabla muestra datos

MySQL:
✅ BD "sigepor" existe
✅ Tablas existen
✅ Datos se guardan
```

---

## 🆘 ÚLTIMO RECURSO

Si nada funciona:

```bash
# 1. Parar todo
Ctrl+C en terminal

# 2. Limpiar completamente
rm -rf node_modules
rm package-lock.json

# 3. Reinstalar
npm install

# 4. Verificar BD
mysql -u root -p
DROP DATABASE sigepor;
mysql -u root -p < database.sql

# 5. Reiniciar
npm start
```

---

**¿Aún no funciona?**
Revisa `INSTALACION_SQL.md` para verificar cada paso.

**¿Necesitas ayuda?**
Abre console (F12) y copia/pega el error en Google.

---

**¡Ánimo! La mayoría de problemas se resuelven en 5 minutos! 💪**
