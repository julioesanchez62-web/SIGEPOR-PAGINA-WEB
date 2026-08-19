# 🚀 INICIO RÁPIDO - SIGEPOR CON SQL

## ⚡ 5 MINUTOS PARA EMPEZAR

### 1️⃣ Crear Base de Datos (2 min)

**Opción A - MySQL Workbench:**
1. Abre MySQL Workbench
2. Copia todo el contenido de `database.sql`
3. Pega en una nueva Query Tab
4. Ejecuta (Ctrl + Shift + Enter)

**Opción B - Línea de comandos:**
```bash
mysql -u root -p < database.sql
```

✅ **Listo:** BD `sigepor` creada con todas las tablas

---

### 2️⃣ Instalar Dependencias (2 min)

```bash
# Abre terminal/PowerShell en la carpeta del proyecto
cd "C:\Users\julio\OneDrive\Desktop\SIGEPOR PAGINA WEB"

# Instala Node.js packages
npm install
```

✅ **Listo:** Se instalaron express, mysql2, bcryptjs, jsonwebtoken, etc.

---

### 3️⃣ Iniciar Servidor (1 min)

```bash
npm start
```

Espera a ver:
```
✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
📊 Base de datos conectada a MySQL
```

✅ **Listo:** Backend ejecutándose

---

### 4️⃣ Abrir Aplicación (Instantáneo)

- Abre `index.html` en tu navegador
- Haz clic en **"👨‍⚕️ VETERINARIOS"**
- Regístrate con datos de prueba
- ¡Listo!

---

## 📋 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `server.js` | Backend Node.js |
| `database.sql` | Script para crear BD |
| `.env` | Configuración MySQL |
| `package.json` | Dependencias |
| `registro_veterinarios.html` | Login/Registro |
| `vacunas.html` | Gestión de vacunas |

---

## 🔧 Si Algo Falla

### "Cannot connect to database"
```bash
# Verifica que MySQL está corriendo
# Edita .env con tus credenciales de MySQL
```

### "Module not found"
```bash
npm install
```

### "Port 3001 already in use"
```bash
# Cambia el puerto en .env
PORT=3002
```

---

## 📖 Documentación Completa

- **INSTALACION_SQL.md** - Guía detallada
- **PRUEBA_RAPIDA.md** - Pasos de prueba
- **RESUMEN_SQL.md** - Resumen técnico

---

## ✅ Verificación

```bash
# ¿Backend ejecutándose?
curl http://localhost:3001

# ¿MySQL conectado?
# Deberías ver mensaje en server.js
```

---

## 🎯 Próximos Pasos

1. ✅ Crear veterinarios
2. ✅ Registrar vacunaciones
3. ✅ Ver datos en tabla
4. ✅ Eliminar registros
5. 📊 Generar reportes (futuro)

---

**¡Listo para usar! Ejecuta `npm start` y abre `index.html`** 🎉
