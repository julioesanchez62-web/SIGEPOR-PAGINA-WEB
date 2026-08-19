# 🐷 Guía para Agregar Imágenes de Cerdos a SIGEPOR

## 📋 Resumen de Mejoras Realizadas

He mejorado visualmente los 3 archivos HTML principales con:
- ✨ Diseño moderno y atractivo
- 🐷 Emojis de cerdos integrados
- 📱 Interfaz responsiva (funciona en móvil, tablet y desktop)
- 🎨 Colores coordinados con tu paleta actual
- 💡 Mejora en la experiencia del usuario

---

## 🖼️ Cómo Agregar Imágenes de Cerdos Reales

### Opción 1: Crear Carpeta de Imágenes (RECOMENDADO)

1. **Crea una carpeta llamada `cerdos`** en tu proyecto:
   ```
   SIGEPOR/
   ├── cerdos/          ← Nueva carpeta
   │   ├── cerdo1.jpg
   │   ├── cerdo2.jpg
   │   └── cerdo3.jpg
   ├── imagenes/        (carpeta existente)
   ├── index.html
   └── style.css
   ```

2. **Descarga imágenes de cerdos** de:
   - 🔗 Unsplash: https://unsplash.com/s/photos/pig
   - 🔗 Pexels: https://www.pexels.com/search/pig/
   - 🔗 Pixabay: https://pixabay.com/search/pig/

3. **Renombra las imágenes** con nombres claros:
   - `cerdo-landrace.jpg`
   - `cerdo-duroc.jpg`
   - `cerdo-yorkshire.jpg`
   - etc.

---

## 📄 Ubicaciones Donde Puedes Agregar Imágenes

### 1. **registroporcino.html** - Galería de Razas
Agrega imágenes en la sección de formulario:

```html
<!-- Después de la sección de form-section-title -->
<div class="breed-gallery">
    <div class="breed-card">
        <img src="cerdos/cerdo-landrace.jpg" alt="Raza Landrace">
        <h4>Landrace</h4>
    </div>
    <div class="breed-card">
        <img src="cerdos/cerdo-duroc.jpg" alt="Raza Duroc">
        <h4>Duroc</h4>
    </div>
    <div class="breed-card">
        <img src="cerdos/cerdo-yorkshire.jpg" alt="Raza Yorkshire">
        <h4>Yorkshire</h4>
    </div>
</div>
```

### 2. **index.html** - Sección Hero
Reemplaza los emojis con imágenes:

```html
<!-- En la sección .hero-features -->
<div class="feature-card">
    <img src="cerdos/cerdo-feliz.jpg" alt="Gestión Porcina" class="feature-image">
    <h3>Registro Porcino</h3>
    <p>Gestiona información completa de tus animales</p>
</div>
```

### 3. **restaurar.html** - Ilustración
Reemplaza la ilustración emoji:

```html
<!-- En .hero-illustration -->
<div class="illustration">
    <img src="cerdos/cerdo-seguro.jpg" alt="Recuperación segura">
</div>
```

---

## 🎨 Estilos CSS para Imágenes

Agrega estos estilos a tu **style.css**:

```css
/* Galería de razas */
.breed-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.breed-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(61, 38, 33, 0.05);
    transition: all 0.3s ease;
}

.breed-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(61, 38, 33, 0.1);
}

.breed-card img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    display: block;
}

.breed-card h4 {
    padding: 15px;
    margin: 0;
    color: #2e1a16;
    font-weight: 700;
    text-align: center;
}

/* Imágenes en feature cards */
.feature-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 12px 12px 0 0;
    margin: -30px -30px 0 -30px;
}

/* Imagen en restaurar página */
.illustration img {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(61, 38, 33, 0.1);
}
```

---

## ⚙️ Cómo Usar Las Nuevas Características

### Página de Registro (registro.html)
- ✅ Formulario mejorado con secciones claramente definidas
- ✅ Campos organizados por categoría
- ✅ Botones de guardar y limpiar
- ✅ Sección de consejos útiles
- ✅ Diseño responsive

### Gestión Porcina (registroporcino.html)
- ✅ Formulario completo para registrar porcinos
- ✅ Tabla con información del inventario
- ✅ Estadísticas rápidas en tiempo real
- ✅ Más opciones de raza y estado de salud
- ✅ Interfaz profesional y moderna

### Restaurar Contraseña (restaurar.html)
- ✅ Diseño atractivo con animación
- ✅ Sección de información lateral
- ✅ Botones claramente identificados
- ✅ Mensaje de ayuda integrado
- ✅ Formulario seguro y fácil de usar

---

## 📸 Recomendaciones Finales

1. **Tamaño de imágenes**: Optimiza las imágenes para web (200-500KB máximo)
2. **Formato**: Usa JPG para fotos, PNG para gráficos
3. **Resolución**: Mínimo 800px de ancho
4. **Alt text**: Siempre agrega descripción (accesibilidad)
5. **Licencia**: Asegúrate de tener permiso para usar las imágenes

---

## 🚀 Pasos Siguientes

1. Descarga imágenes de cerdos
2. Crea la carpeta `cerdos/` en tu proyecto
3. Copia las imágenes a esa carpeta
4. Edita los archivos HTML para incluir las imágenes
5. Agrega los estilos CSS proporcionados
6. ¡Disfruta de tu aplicación mejorada! 🎉

---

**¿Necesitas más personalizaciones? Contacta al equipo de soporte.**
