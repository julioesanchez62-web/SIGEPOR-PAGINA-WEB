# 📋 Sistema de Registro y Gestión de Veterinarios - SIGEPOR

## 🎯 Descripción General

Se ha creado un **sistema completo de autenticación y gestión de veterinarios** con las siguientes características:

- ✅ **Registro de veterinarios** con validaciones
- ✅ **Login seguro** con usuario y contraseña
- ✅ **Gestión de vacunas** (solo accesible con sesión activa)
- ✅ **Control de sesiones** con almacenamiento local
- ✅ **Interfaz moderna y responsiva**

---

## 📁 Archivos Creados

### 1. **registro_veterinarios.html**
Página con dos pestañas:
- **Iniciar Sesión**: Login con usuario y contraseña
- **Registrarse**: Formulario para crear nueva cuenta de veterinario

**Campos de registro:**
- Nombre completo del veterinario
- Correo electrónico
- Usuario único
- Contraseña (mínimo 6 caracteres)
- Confirmación de contraseña

**Validaciones:**
- ✓ Usuario único (no puede repetirse)
- ✓ Contraseña confirmada
- ✓ Contraseña con mínimo 6 caracteres

---

### 2. **vacunas.html**
Página protegida de gestión de vacunaciones (requiere login)

**Características:**
- 📝 Formulario para registrar nuevas vacunaciones
- 📊 Estadísticas en tiempo real
- 📋 Tabla con todas las vacunaciones del veterinario
- 🚪 Botón de cerrar sesión
- ✓ Solo muestra datos del veterinario logueado

**Campos de registro de vacuna:**
- ID del Porcino
- Nombre de la vacuna
- Fecha de aplicación
- Estado (Aplicada, Pendiente, Retrasada)
- Dosis en ml
- Próxima vacuna (días)
- Notas adicionales

---

### 3. **index.html** (Actualizado)
Se añadió un botón **"👨‍⚕️ VETERINARIOS"** en la sección principal para acceder fácilmente al sistema de veterinarios.

---

## 🔐 Cómo Funciona la Autenticación

### 📝 Registro de un Nuevo Veterinario:

1. Ir a **"👨‍⚕️ VETERINARIOS"** desde el inicio
2. Clickear en pestaña **"📝 Registrarse"**
3. Completar todos los campos
4. Clickear **"Registrarse"**
5. Se muestra confirmación exitosa y redirige a login

Los datos se guardan en **localStorage** del navegador.

### 🔐 Iniciar Sesión:

1. Ir a la página de veterinarios
2. Ingresar usuario y contraseña
3. Clickear **"Iniciar Sesión"**
4. Se redirige automáticamente a **vacunas.html**

---

## 💉 Gestión de Vacunas

### Acceso:
- Solo se puede acceder con sesión activa
- Si intenta acceder sin login, redirige a registro_veterinarios.html

### Funcionalidades:
- **Registrar nuevas vacunaciones** con fecha, dosis, estado, etc.
- **Ver tabla** de todas sus vacunaciones
- **Estadísticas** de vacunas aplicadas/pendientes
- **Editar** y **eliminar** registros (botones disponibles)

### Datos Almacenados:
Cada vacunación incluye:
- ID único
- ID del porcino
- Nombre de la vacuna
- Fecha, estado, dosis
- Próxima fecha (días)
- Notas
- Usuario/veterinario que registró

---

## 💾 Almacenamiento de Datos

Los datos se guardan en **localStorage** del navegador:

```javascript
// Veterinarios registrados
localStorage.getItem('veterinarios') // Array de objetos

// Sesión actual activa
localStorage.getItem('veterinarioActivo') // Objeto del vet logueado

// Vacunaciones
localStorage.getItem('vacunas') // Array de objetos
```

---

## 🎨 Diseño y Estilos

- ✅ Interfaz moderna con gradientes
- ✅ Responsivo para móvil y desktop
- ✅ Animaciones suaves
- ✅ Colores coherentes con SIGEPOR
- ✅ Iconos emoji para mejor identificación

---

## 🔧 Validaciones Implementadas

✓ Usuario único al registrar  
✓ Contraseñas coinciden al registrar  
✓ Contraseña mínimo 6 caracteres  
✓ Credenciales correctas al login  
✓ Sesión requerida para acceder a vacunas.html  
✓ Email válido (validación HTML5)  

---

## 📞 Flujo de Usuarios

```
index.html (Inicio)
    ↓
"👨‍⚕️ VETERINARIOS"
    ↓
registro_veterinarios.html
    ├─→ NUEVA CUENTA? → Registrarse → Validaciones → Confirmación
    │
    └─→ YA TIENE CUENTA? → Login → Validación → vacunas.html
                                              ↓
                                      Gestionar vacunas
                                              ↓
                                      Cerrar sesión → registro_veterinarios.html
```

---

## 🚀 Cómo Usar

### Desde el navegador:
1. Abrir `index.html`
2. Clickear en **"👨‍⚕️ VETERINARIOS"**
3. Registrarse o iniciar sesión
4. Gestionar vacunaciones

### Ejemplo de Prueba:
- **Usuario:** vet123
- **Contraseña:** prueba123
- Registrar porcino P-001 con vacuna Aujeszky el 24/05/2026

---

## ⚙️ Funciones JavaScript Principales

```javascript
// Cambiar entre pestañas
switchTab(tabName)

// Mostrar/ocultar mensajes
showMessage(element, message, type)

// Cargar vacunaciones del veterinario
cargarVacunas()

// Actualizar estadísticas
actualizarEstadisticas()

// Eliminar vacunación
eliminarVacuna(id)

// Cerrar sesión
cerrarSesion()
```

---

## 📱 Compatibilidad

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Navegadores móviles

---

## 🔒 Seguridad (Nota Importante)

**localStorage es solo para desarrollo/demostración.** Para un sistema en producción, se debe:
- Usar un backend con base de datos (Node.js, Python, etc.)
- Implementar hash de contraseñas (bcrypt)
- Usar JWT o sesiones seguras
- Validaciones en servidor (no solo cliente)
- HTTPS obligatorio

---

## 📝 Mejoras Futuras

- [ ] Integración con backend
- [ ] Hash de contraseñas
- [ ] Autenticación con 2FA
- [ ] Recuperación de contraseña por email
- [ ] Edición de vacunaciones
- [ ] Exportar reportes (PDF/Excel)
- [ ] Panel de administrador
- [ ] Historial de cambios

---

**¡Sistema listo para usar! 🎉**
