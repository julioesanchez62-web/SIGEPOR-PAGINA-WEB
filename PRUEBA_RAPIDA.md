# 🧪 Guía Rápida de Prueba

## ✅ Pasos para Probar el Sistema

### 1. Preparar MySQL

Ejecuta en MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS sigepor;
USE sigepor;

CREATE TABLE veterinarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE vacunaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    veterinario_id INT NOT NULL,
    porcino_id VARCHAR(50) NOT NULL,
    nombre_vacuna VARCHAR(255) NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    dosis DECIMAL(5, 2),
    proxima_vacuna_dias INT,
    notas TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id)
);
```

### 2. Instalar y Ejecutar Backend

```bash
cd "C:\Users\julio\OneDrive\Desktop\SIGEPOR PAGINA WEB"
npm install
npm start
```

Espera a ver:
```
✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
📊 Base de datos conectada a MySQL
```

### 3. Abrir la Aplicación

- Abre `index.html` en el navegador
- Haz clic en **"👨‍⚕️ VETERINARIOS"**

### 4. Registrar Veterinario de Prueba

**Pestaña: 📝 Registrarse**
- Nombre: `Dr. Carlos Pérez`
- Email: `carlos@email.com`
- Usuario: `carlos123`
- Contraseña: `prueba123`
- Confirmar: `prueba123`

Haz clic en **"Registrarse"**

### 5. Iniciar Sesión

**Pestaña: 🔐 Iniciar Sesión**
- Usuario: `carlos123`
- Contraseña: `prueba123`

Haz clic en **"Iniciar Sesión"**

→ Deberías redirigirte a `vacunas.html`

### 6. Registrar Vacunación de Prueba

**Formulario: ➕ Registrar Nueva Vacunación**
- ID Porcino: `P-001`
- Nombre Vacuna: `Aujeszky`
- Fecha: `24/05/2026`
- Estado: `✓ Aplicada`
- Dosis: `2.5` ml
- Próxima Vacuna: `14` días
- Notas: `Primera aplicación sin incidencias`

Haz clic en **"💾 GUARDAR VACUNACIÓN"**

→ Deberías ver la vacuna en la tabla

### 7. Verifica los Datos

- Ve a MySQL Workbench
- Ejecuta:

```sql
SELECT * FROM veterinarios;
SELECT * FROM vacunaciones;
```

---

## 🔍 Verificación de Logs

### Terminal (Servidor Node.js)

Deberías ver algo como:
```
✅ Servidor SIGEPOR ejecutándose en http://localhost:3001
📊 Base de datos conectada a MySQL
```

### Consola del Navegador (F12)

Abre DevTools y ve a **Console**. No debes ver errores rojos.

---

## 🐛 Si Algo Falla

| Problema | Solución |
|----------|----------|
| "Cannot connect to database" | Verifica que MySQL está ejecutándose y credenciales en `.env` |
| "CORS error" | Asegúrate que el servidor está en `http://localhost:3001` |
| "Module not found" | Ejecuta `npm install` nuevamente |
| "Cannot find table" | Ejecuta el script `database.sql` en MySQL |
| "Conexión rechazada" | Reinicia el servidor Node.js |

---

## 📱 Flujo Completo de Prueba

```
1. Abre index.html
   ↓
2. Click en "👨‍⚕️ VETERINARIOS"
   ↓
3. Click en "📝 Registrarse"
   ↓
4. Completa formulario y registra
   ↓
5. Click en "🔐 Iniciar Sesión"
   ↓
6. Inicia sesión con credenciales
   ↓
7. Se abre vacunas.html
   ↓
8. Completa formulario de vacunación
   ↓
9. Click "💾 GUARDAR VACUNACIÓN"
   ↓
10. Vacuna aparece en tabla ✅
```

---

## 🎯 Pruebas Adicionales

### Prueba: Eliminar Vacunación

1. En la tabla, busca una vacunación
2. Haz clic en botón **"Eliminar"**
3. Confirma la eliminación
4. Verifica que desaparece

### Prueba: Múltiples Veterinarios

1. Crea otro veterinario con usuario diferente
2. Inicia sesión con el segundo veterinario
3. Verifica que solo ve sus vacunaciones

### Prueba: Error de Login

1. Intenta login con usuario incorrecto
2. Deberías ver: `"✗ Usuario o contraseña incorrectos"`

### Prueba: Cerrar Sesión

1. Haz clic en botón **"🚪 Cerrar Sesión"**
2. Confirma la acción
3. Deberías volver a `registro_veterinarios.html`

---

## 📊 Datos de Prueba para MySQL

Si deseas insertar datos manualmente:

```sql
INSERT INTO veterinarios (nombre, email, usuario, contraseña, fecha_registro)
VALUES ('Dr. Test', 'test@email.com', 'test', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Ci', 
        NOW());

INSERT INTO vacunaciones (veterinario_id, porcino_id, nombre_vacuna, 
                         fecha_aplicacion, estado, dosis, proxima_vacuna_dias, notas)
VALUES (1, 'P-001', 'PCV2', '2026-05-24', 'Aplicada', 2.0, 21, 'Prueba');
```

---

✅ **¡Sistema listo para probar!**
