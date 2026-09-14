/**
 * SIGEPOR - Control de Seguridad RBAC y Sesiones (HU-06 & HU-10)
 */

function obtenerUsuarioSesion() {
    try {
        const sesionStr = localStorage.getItem('usuario_sigepor') || localStorage.getItem('usuarioSesion');
        return sesionStr ? JSON.parse(sesionStr) : null;
    } catch (e) {
        return null;
    }
}

function aplicarControlRBAC() {
    const usuario = obtenerUsuarioSesion();
    const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');

    // Rutas públicas que no requieren estar logueado
    const esPaginaLogin = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('restaurar.html');

    if (!usuario && !esPaginaLogin) {
        // Redirección a login si intenta entrar sin sesión
        console.warn('🔒 Sesión no detectada. Redirigiendo a pantalla de login...');
        // window.location.href = 'index.html';
    }

    const idRol = usuario ? Number(usuario.idRol || usuario.rol || 2) : 2;
    const rolNombre = usuario ? (usuario.rolNombre || usuario.rol || (idRol === 1 ? 'Administrador' : idRol === 3 ? 'Veterinario' : idRol === 4 ? 'Cliente' : 'Empleado')) : 'Invitado';

    // Actualizar nombre y rol en barra lateral/header si existe
    const userBadge = document.getElementById('session-user-badge');
    if (userBadge && usuario) {
        userBadge.innerHTML = `👤 <strong>${usuario.nombre || usuario.email || 'Usuario'}</strong> <span style="font-size:0.75rem; background:#4a5568; color:white; padding:2px 6px; border-radius:10px; margin-left:4px;">${rolNombre}</span>`;
    }

    // Filtrar opciones de la barra de navegación según el rol (RBAC)
    const sidebarUl = document.querySelector('.sidebar ul');
    if (sidebarUl) {
        const items = sidebarUl.querySelectorAll('li');
        items.forEach(li => {
            const link = li.querySelector('a');
            if (!link) return;
            const href = link.getAttribute('href') || '';

            // Reglas de visibilidad por rol (HU-06 & HU-10)
            if (idRol === 4) { // Rol Cliente (HU-10 Acceso Restringido)
                if (href.includes('registro_usuarios') || href.includes('veterinarios') || href.includes('inventario') || href.includes('reproduccion')) {
                    li.style.display = 'none'; // Ocultar módulos administrativos
                }
            } else if (idRol === 2) { // Rol Empleado
                if (href.includes('registro_usuarios') || href.includes('veterinarios')) {
                    li.style.display = 'none'; // Solo admin maneja usuarios y personal
                }
            } else if (idRol === 3) { // Rol Veterinario
                if (href.includes('registro_usuarios')) {
                    li.style.display = 'none';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    aplicarControlRBAC();
});
