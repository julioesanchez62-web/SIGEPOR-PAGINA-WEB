/**
 * SIGEPOR - Control de Seguridad RBAC y Sesiones (HU-06 & HU-10)
 * Sistema de Gestión Porcina
 */

// 1. Obtener datos del usuario desde la sesión (localStorage o sessionStorage)
function obtenerUsuarioSesion() {
    try {
        const sesionStr = localStorage.getItem('usuario_sigepor') || 
                          localStorage.getItem('usuarioSesion') ||
                          sessionStorage.getItem('usuario_sigepor') ||
                          sessionStorage.getItem('usuarioSesion');
        return sesionStr ? JSON.parse(sesionStr) : null;
    } catch (e) {
        console.error('Error leyendo la sesión del usuario:', e);
        return null;
    }
}

// 2. Obtener el ID numérico del rol del usuario
function obtenerRolSesion() {
    const usuario = obtenerUsuarioSesion();
    if (!usuario) return null;
    const idRol = Number(usuario.idRol || usuario.rol || usuario.roleId || 2);
    return idRol;
}

// 3. Matriz de permisos por vista/ruta
// Rol 1: Administrador (Acceso total)
// Rol 3: Veterinario (Salud, Vacunas, Inventario, Gestión Porcina)
// Rol 2: Usuario / Operario (Gestión Porcina, Reproducción, Inventario básico)
const PERMISOS_RUTAS = {
    'registroporcino.html': [1, 2, 3],
    'reproduccion.html': [1, 2],
    'inventario.html': [1, 2, 3],
    'vacunas.html': [1, 3],
    'veterinarios.html': [1],
    'reportes.html': [1],
    'registro_usuarios.html': [1]
};

// Página principal por defecto para cada rol al redirigir
const PAGINA_INICIO_ROL = {
    1: 'registroporcino.html',
    3: 'vacunas.html',
    2: 'registroporcino.html'
};

/**
 * Función centralizada para validar autenticación y permisos RBAC
 * @param {number|number[]} [roleRequired] - Rol o lista de roles requeridos para la vista
 */
function checkAuthAndPermissions(roleRequired = null) {
    // Identificar la página actual
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    
    // Rutas públicas que no requieren estar autenticado ni validación de rol (Acceso Libre)
    const esPaginaPublica = pageName === 'index.html' || pageName === '' || pageName === 'restaurar.html' || pageName === 'registro_usuarios.html';

    // Si la vista es pública (Login, Registro de Usuarios, Recuperación), permitir acceso directo inmediato
    if (esPaginaPublica) {
        return true;
    }

    const usuario = obtenerUsuarioSesion();
    const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token') || sessionStorage.getItem('token');

    // A. Validar Autenticación (Redirección a login si intenta entrar sin sesión activa en páginas protegidas)
    if (!usuario || !token) {
        console.warn('🔒 Sesión no detectada. Redirigiendo a pantalla de inicio de sesión...');
        alert('Debes iniciar sesión para acceder al sistema SIGEPOR.');
        window.location.href = 'index.html';
        return false;
    }

    const idRol = obtenerRolSesion() || 2;
    const rolNombre = usuario.rolNombre || usuario.rol || 
        (idRol === 1 ? 'Administrador' : idRol === 3 ? 'Veterinario' : idRol === 4 ? 'Cliente' : 'Usuario / Operario');

    // B. Validar Autorización (Acceso a la página actual según el rol)
    let rolesPermitidos = roleRequired ? (Array.isArray(roleRequired) ? roleRequired : [roleRequired]) : PERMISOS_RUTAS[pageName];

    // Si la ruta tiene restricciones y el rol no está autorizado
    if (rolesPermitidos && !rolesPermitidos.includes(idRol)) {
        console.warn(`⛔ Acceso denegado: El rol ${rolNombre} (${idRol}) no tiene permiso para la vista ${pageName}.`);
        alert(`Acceso Denegado: Tu rol (${rolNombre}) no tiene permisos suficientes para acceder a esta sección.`);
        
        const destino = PAGINA_INICIO_ROL[idRol] || 'registroporcino.html';
        window.location.href = destino;
        return false;
    }

    // C. Actualizar badge de usuario en la interfaz si existe elemento en el DOM
    actualizarBadgeUsuario(usuario, rolNombre);

    // D. Ocultar o deshabilitar dinámicamente opciones del menú y botones de acción en el DOM
    aplicarFiltrosDOMPorRol(idRol);

    return true;
}

// Actualizar indicador de usuario en header/sidebar
function actualizarBadgeUsuario(usuario, rolNombre) {
    const userBadge = document.getElementById('session-user-badge') || document.querySelector('.user-profile-badge');
    if (userBadge && usuario) {
        userBadge.innerHTML = `👤 <strong>${usuario.nombre || usuario.email || 'Usuario'}</strong> <span style="font-size:0.75rem; background:#4a5568; color:white; padding:2px 6px; border-radius:10px; margin-left:4px;">${rolNombre}</span>`;
    }
}

// Ocultar o deshabilitar elementos del DOM según el rol detectado
function aplicarFiltrosDOMPorRol(idRol) {
    // 1. Filtrar opciones de la barra de navegación (.sidebar ul li, .nav-links)
    const menuContainers = document.querySelectorAll('.sidebar ul, .nav-links, nav ul');
    menuContainers.forEach(container => {
        const items = container.querySelectorAll('li, a');
        items.forEach(item => {
            const link = item.tagName === 'A' ? item : item.querySelector('a');
            if (!link) return;

            const href = link.getAttribute('href') || '';
            const pageTarget = href.substring(href.lastIndexOf('/') + 1);

            if (!pageTarget || pageTarget === '#' || pageTarget.startsWith('javascript:')) return;

            const permitidos = PERMISOS_RUTAS[pageTarget];
            if (permitidos && !permitidos.includes(idRol)) {
                if (item.tagName === 'LI') {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    });

    // 2. Ocultar o deshabilitar botones de acción en la interfaz (.cta-buttons, .btn-primary, .btn-delete, etc.) según el rol
    if (idRol === 2) { // Rol Usuario / Operario
        // Inhabilitar/Ocultar botones de eliminación de registros (eliminación no permitida para Operario)
        document.querySelectorAll('.btn-delete, .btn-table-delete, [data-action="delete"]').forEach(btn => {
            btn.style.display = 'none';
        });

        // Ocultar botones de reportes financieros o edición de precios
        document.querySelectorAll('.btn-financial, .link-financial, .cta-buttons .btn-financial').forEach(btn => {
            btn.style.display = 'none';
        });

    } else if (idRol === 3) { // Rol Veterinario
        // Ocultar botones de gestión de usuarios y reportes financieros
        document.querySelectorAll('.btn-user-admin, .btn-financial, [data-module="usuarios"]').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// 4. Función centralizada para cerrar sesión de manera segura
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión en SIGEPOR?')) {
        localStorage.removeItem('usuarioSesion');
        localStorage.removeItem('usuario_sigepor');
        localStorage.removeItem('sigepor_token');
        localStorage.removeItem('token');
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// Exportación global de funciones RBAC
window.checkAuthAndPermissions = checkAuthAndPermissions;
window.obtenerUsuarioSesion = obtenerUsuarioSesion;
window.obtenerRolSesion = obtenerRolSesion;
window.aplicarFiltrosDOMPorRol = aplicarFiltrosDOMPorRol;
window.cerrarSesion = cerrarSesion;

// Ejecución automática al cargar la estructura del DOM
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndPermissions();
});
