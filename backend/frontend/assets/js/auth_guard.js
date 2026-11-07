/**
 * SIGEPOR - Control de Seguridad RBAC, Renderizado Condicional y Guardián de Rutas
 * Sistema de Gestión Porcina 2026
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. UTILIDADES DE SESIÓN Y TOKENS JWT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decodifica de forma segura el payload de un token JWT sin dependencias externas
 */
function decodificarTokenJWT(token) {
    try {
        if (!token || typeof token !== 'string') return null;
        const partes = token.split('.');
        if (partes.length < 2) return null;
        const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

/**
 * Obtiene los datos del usuario en sesión desde Storage o mediante decodificación del JWT
 */
function obtenerUsuarioSesion() {
    try {
        const sesionStr = localStorage.getItem('usuario_sigepor') || 
                          localStorage.getItem('usuarioSesion') ||
                          sessionStorage.getItem('usuario_sigepor') ||
                          sessionStorage.getItem('usuarioSesion');
        if (sesionStr) {
            return JSON.parse(sesionStr);
        }

        // Fallback: extraer usuario decodificando el token JWT guardado
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
        const jwtData = decodificarTokenJWT(token);
        if (jwtData) {
            return {
                id: jwtData.id || jwtData.id_usuario,
                nombre: jwtData.nombre || jwtData.name || 'Usuario',
                email: jwtData.email || jwtData.correo || '',
                idRol: jwtData.idRol || jwtData.rol || 4,
                rolNombre: jwtData.rolNombre || jwtData.rol || 'Cliente'
            };
        }
        return null;
    } catch (e) {
        console.error('[RBAC] Error leyendo la sesión del usuario:', e);
        return null;
    }
}

/**
 * Obtiene el ID numérico del rol del usuario autenticado (1=Admin, 2=Empleado, 3=Veterinario, 4=Cliente)
 */
function obtenerRolSesion() {
    const usuario = obtenerUsuarioSesion();
    if (usuario) {
        if (usuario.idRol !== undefined && usuario.idRol !== null && !isNaN(Number(usuario.idRol))) {
            return Number(usuario.idRol);
        }
        if (usuario.rol !== undefined && usuario.rol !== null) {
            if (!isNaN(Number(usuario.rol))) return Number(usuario.rol);
            const r = String(usuario.rol).toLowerCase();
            if (r.includes('admin')) return 1;
            if (r.includes('empleado') || r.includes('operador')) return 2;
            if (r.includes('vet')) return 3;
            if (r.includes('client')) return 4;
        }
    }

    // Fallback directo desde token JWT
    const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
    const jwtData = decodificarTokenJWT(token);
    if (jwtData) {
        const r = jwtData.idRol || jwtData.rol;
        if (r && !isNaN(Number(r))) return Number(r);
    }

    return 4; // Por defecto rol de mínimos privilegios (Cliente)
}

/**
 * Retorna el nombre formateado y legible del rol
 */
function obtenerNombreRol(idRol) {
    switch (Number(idRol)) {
        case 1: return 'Administrador';
        case 2: return 'Empleado / Operario';
        case 3: return 'Veterinario';
        case 4: return 'Cliente';
        default: return 'Cliente';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MATRIZ DE CONTROL DE ACCESO (RBAC) Y RUTAS SEGURAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Matriz de autorización por vista HTML:
 * Rol 1: Administrador (Acceso total)
 * Rol 2: Empleado / Operario (Porcinos, Reproducción, Inventario, Proveedores, Corrales)
 * Rol 3: Veterinario (Salud, Vacunas, Diagnósticos, Veterinarios, Reportes, Porcinos)
 * Rol 4: Cliente (Estrictamente Inicio y vista catálogo de Porcinos)
 */
const PERMISOS_RUTAS = {
    'indexpruebados.html': [1, 2, 3, 4],
    'inicio.html': [1, 2, 3, 4],
    'registroporcino.html': [1, 2, 3, 4], // Cliente tiene acceso solo lectura / consulta
    'corrales.html': [1, 2, 3],
    'enfermedades.html': [1, 3],
    'vacunas.html': [1, 3],
    'reproduccion.html': [1, 2, 3],
    'inventario.html': [1, 2, 3],
    'proveedores.html': [1, 2],
    'logs_actividad.html': [1],
    'veterinarios.html': [1], // Exclusivo Administrador: El personal veterinario no puede autogestionar la tabla de personal
    'reportes.html': [1, 3],
    'gestion_usuarios.html': [1],
    'registro_usuarios.html': [1, 2, 3, 4]
};

/**
 * Página principal segura por defecto para cada rol al redirigir
 */
const PAGINA_INICIO_ROL = {
    1: 'registroporcino.html',
    2: 'registroporcino.html',
    3: 'vacunas.html',
    4: 'indexpruebados.html' // Página de Inicio segura para Clientes
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GUARDIÁN DE RUTAS (ROUTE GUARD) SEGURO Y NO BLOQUEANTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida autenticación y permisos de acceso para la página actual.
 * Si el acceso es denegado, redirige limpiamente mediante window.location.replace()
 * sin alertas nativas bloqueantes ni historiales corruptos.
 * 
 * @param {number|number[]} [roleRequired] - Rol o lista de roles requeridos explícitos
 * @returns {boolean} True si está autorizado, False si fue redirigido
 */
function checkAuthAndPermissions(roleRequired = null) {
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    
    // Rutas públicas que no requieren autenticación
    const esPaginaPublica = pageName === 'index.html' || pageName === '' || pageName === 'restaurar.html' || pageName === 'registro_usuarios.html';

    if (esPaginaPublica) {
        const usuarioSesion = obtenerUsuarioSesion();
        if (!usuarioSesion) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.style.display = 'none';
            const mainContainer = document.querySelector('.main-container');
            if (mainContainer) mainContainer.style.gridTemplateColumns = '1fr';
        } else {
            const idRol = obtenerRolSesion();
            aplicarFiltrosDOMPorRol(idRol);
        }
        return true;
    }

    const usuario = obtenerUsuarioSesion();
    const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token') || sessionStorage.getItem('token');

    // A. Validar Autenticación
    if (!usuario || !token) {
        console.warn('🔒 Sesión no detectada. Redirigiendo a pantalla de login...');
        sessionStorage.setItem('sigepor_flash_toast', JSON.stringify({
            tipo: 'warning',
            titulo: 'Autenticación Requerida',
            mensaje: 'Debes iniciar sesión con tus credenciales para acceder al sistema SIGEPOR.'
        }));
        
        // Ocultar vista inmediatamente para prevenir parpadeos no autorizados
        document.documentElement.style.visibility = 'hidden';
        window.location.replace('index.html');
        return false;
    }

    const idRol = obtenerRolSesion();
    const rolNombre = usuario.rolNombre || obtenerNombreRol(idRol);

    // B. Validar Autorización de Rol
    let rolesPermitidos = roleRequired 
        ? (Array.isArray(roleRequired) ? roleRequired : [roleRequired]) 
        : PERMISOS_RUTAS[pageName];

    // Intercepción específica para veterinarios.html (Exclusivo para Administrador)
    if (pageName === 'veterinarios.html' && idRol !== 1) {
        console.warn(`⛔ Acceso interceptado a veterinarios.html: El rol '${rolNombre}' (${idRol}) intentó forzar la ruta.`);
        sessionStorage.setItem('sigepor_flash_toast', JSON.stringify({
            tipo: 'warning',
            titulo: 'Acceso Denegado',
            mensaje: 'Acceso Denegado: Exclusivo para Administradores'
        }));
        document.documentElement.style.visibility = 'hidden';
        window.location.replace('inicio.html');
        return false;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(idRol)) {
        console.warn(`⛔ Acceso restringido: El rol '${rolNombre}' (${idRol}) no tiene permiso para '${pageName}'.`);
        
        // Destino seguro para la redirección automática
        const destinoSeguro = PAGINA_INICIO_ROL[idRol] || 'inicio.html';
        
        // Registrar notificación Toast profesional para la vista de destino
        sessionStorage.setItem('sigepor_flash_toast', JSON.stringify({
            tipo: 'warning',
            titulo: 'Acceso Restringido (RBAC)',
            mensaje: `Tu perfil de ${rolNombre} no tiene autorización para acceder a ${pageName.replace('.html', '').toUpperCase()}. Redirigiendo a tu panel principal.`
        }));

        // Ocultar el documento de inmediato para evitar Flash de Contenido No Autorizado (FOUC)
        document.documentElement.style.visibility = 'hidden';

        // Redirección profesional sin alert() modal, sustituyendo el historial de navegación
        window.location.replace(destinoSeguro);
        return false;
    }

    // Documento autorizado: asegurar visibilidad normal
    document.documentElement.style.visibility = 'visible';

    // C. Actualizar badge de usuario en la interfaz
    actualizarBadgeUsuario(usuario, rolNombre);

    // D. Aplicar renderizado condicional del menú lateral y controles
    aplicarFiltrosDOMPorRol(idRol);

    // E. Mostrar notificación Toast si el usuario venía redirigido
    mostrarToastPendiente();

    return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RENDERIZADO CONDICIONAL DEL MENÚ LATERAL Y CONTROLES DEL DOM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Oculta dinámicamente los elementos del menú lateral y los botones de acción
 * según el rol del usuario autenticado.
 * 
 * - Rol 4 (Cliente): Se ocultan todos los enlaces excepto 'Inicio' y 'Porcinos'.
 * - Rol 3 (Veterinario): Se oculta 'Veterinarios' (gestión de personal) y 'Gestión de Usuarios',
 *   manteniendo acceso total a los módulos operativos (Porcinos, Corrales, Enfermedades, Vacunación, Inventario, Reproducción).
 */
function aplicarFiltrosDOMPorRol(idRol) {
    const rol = Number(idRol || obtenerRolSesion());
    const esCliente = (rol === 4);
    const esVeterinario = (rol === 3);

    // 1. Filtrar enlaces del menú lateral (.sidebar ul li, .nav-links li, nav ul li)
    const menuItems = document.querySelectorAll('.sidebar ul li, .nav-links li, nav ul li');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a') || (item.tagName === 'A' ? item : null);
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const pageTarget = href.substring(href.lastIndexOf('/') + 1);

        if (!pageTarget || pageTarget === '#' || pageTarget.startsWith('javascript:')) return;

        // Regla estricta para Cliente: Solo puede ver Inicio y Porcinos
        if (esCliente) {
            const esInicio = pageTarget === 'indexpruebados.html' || pageTarget === 'inicio.html';
            const esPorcinos = pageTarget === 'registroporcino.html';

            if (!esInicio && !esPorcinos) {
                // Ocultar completamente y retirar de accesibilidad
                item.style.setProperty('display', 'none', 'important');
                item.setAttribute('aria-hidden', 'true');
            } else {
                item.style.display = '';
                item.removeAttribute('aria-hidden');
            }
        } else if (esVeterinario) {
            // Regla estricta para Veterinario: Ocultar gestión de otros veterinarios y gestión de usuarios
            if (pageTarget === 'veterinarios.html' || pageTarget === 'gestion_usuarios.html') {
                item.style.setProperty('display', 'none', 'important');
                item.setAttribute('aria-hidden', 'true');
            } else {
                item.style.display = '';
                item.removeAttribute('aria-hidden');
            }
        } else {
            // Demás roles (Admin, Empleado): consultar matriz de permisos
            const permitidos = PERMISOS_RUTAS[pageTarget];
            if (permitidos && !permitidos.includes(rol)) {
                item.style.setProperty('display', 'none', 'important');
                item.setAttribute('aria-hidden', 'true');
            } else {
                item.style.display = '';
                item.removeAttribute('aria-hidden');
            }
        }
    });

    // 2. Control granular de botones y formularios interactivos
    if (esCliente) {
        // En Porcinos u otras vistas: ocultar formularios de registro/edición y botones de acción
        document.querySelectorAll(
            '.card-wrapper:has(form), form.grid-form, .form-actions, ' +
            '.btn-save, .btn-primary, .btn-delete, .btn-table-delete, .btn-table-edit, ' +
            '.btn-edit, .btn-update, .btn-consult, .admin-only-controls, [data-action="delete"], [data-action="edit"]'
        ).forEach(el => {
            el.style.setProperty('display', 'none', 'important');
        });

        // Actualizar subtítulos explicativos de modo lectura
        const sub = document.querySelector('.page-header p');
        if (sub && window.location.pathname.includes('registroporcino.html')) {
            sub.textContent = 'Catálogo y consulta informativa de porcinos (Modo Solo Lectura - Cliente)';
        }
    } else if (rol === 2) { // Empleado / Operario
        document.querySelectorAll('.btn-delete, .btn-table-delete, [data-action="delete"]').forEach(btn => {
            btn.style.setProperty('display', 'none', 'important');
        });
        document.querySelectorAll('.btn-financial, .link-financial, .cta-buttons .btn-financial').forEach(btn => {
            btn.style.setProperty('display', 'none', 'important');
        });
    } else if (rol === 3) { // Veterinario
        document.querySelectorAll('.btn-user-admin, .btn-financial, [data-module="usuarios"]').forEach(btn => {
            btn.style.setProperty('display', 'none', 'important');
        });
    } else if (rol === 1) { // Administrador (Acceso total)
        document.querySelectorAll('.btn-delete, .btn-table-delete, .btn-edit, .btn-table-edit, .btn-update, [data-action="delete"]').forEach(btn => {
            btn.style.display = '';
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TOAST NOTIFICATIONS (EXPERIENCIA UI/UX PROFESIONAL NO BLOQUEANTE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Muestra una notificación flotante estilo Toast en lugar de un alert() modal invasivo
 */
function mostrarToastPendiente() {
    try {
        const toastDataStr = sessionStorage.getItem('sigepor_flash_toast');
        if (!toastDataStr) return;
        sessionStorage.removeItem('sigepor_flash_toast');
        const toastData = JSON.parse(toastDataStr);

        let container = document.getElementById('sigepor-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sigepor-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 420px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(239, 68, 68, 0.4);
            border-left: 4px solid #ef4444;
            backdrop-filter: blur(14px);
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(239, 68, 68, 0.25);
            color: #f8fafc;
            font-family: 'Plus Jakarta Sans', sans-serif;
            pointer-events: auto;
            transform: translateX(50px);
            opacity: 0;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 1.4rem; line-height: 1;">🛡️</span>
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 0.92rem; margin-bottom: 4px; color: #fca5a5;">
                        ${toastData.titulo || 'Notificación de Acceso'}
                    </div>
                    <div style="font-size: 0.83rem; color: #cbd5e1; line-height: 1.4;">
                        ${toastData.mensaje || ''}
                    </div>
                </div>
                <button type="button" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; padding: 0; margin-left: 8px; line-height: 1;" onclick="this.closest('div').parentElement.remove()">✕</button>
            </div>
        `;

        container.appendChild(toast);

        // Animación suave de entrada
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto-cierre progresivo
        setTimeout(() => {
            toast.style.transform = 'translateX(50px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 4500);

    } catch (e) {
        console.error('[Toast] Error desplegando notificación:', e);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ACTUALIZACIÓN DE PERFIL Y CIERRE DE SESIÓN
// ─────────────────────────────────────────────────────────────────────────────

function actualizarBadgeUsuario(usuario, rolNombre) {
    const userBadge = document.getElementById('session-user-badge') || document.querySelector('.user-profile-badge');
    if (userBadge && usuario) {
        userBadge.innerHTML = `👤 <strong>${usuario.nombre || usuario.email || 'Usuario'}</strong> <span style="font-size:0.75rem; background:#4a5568; color:white; padding:2px 6px; border-radius:10px; margin-left:4px;">${rolNombre}</span>`;
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión en SIGEPOR?')) {
        localStorage.removeItem('usuarioSesion');
        localStorage.removeItem('usuario_sigepor');
        localStorage.removeItem('sigepor_token');
        localStorage.removeItem('token');
        sessionStorage.clear();
        window.location.replace('index.html');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPONENTES GLOBALES UI (BOTÓN FLOTANTE WHATSAPP & TOGGLE MODO CLARO/OSCURO)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplica el tema guardado en localStorage inmediatamente para evitar parpadeos
 */
function aplicarTemaInmediato() {
    try {
        const temaGuardado = localStorage.getItem('sigepor_theme');
        if (temaGuardado === 'light') {
            document.documentElement.classList.add('light-theme');
            if (document.body) document.body.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
            if (document.body) document.body.classList.remove('light-theme');
        }
    } catch (e) {
        console.warn('[Tema] No se pudo leer la preferencia de tema:', e);
    }
}

/**
 * Inyecta el botón de cambio de tema (Claro / Oscuro) en la barra de navegación superior
 */
function inyectarToggleTema() {
    if (document.getElementById('sigepor-theme-toggle-btn')) return;

    const navActions = document.querySelector('.top-navbar .nav-right-actions') || 
                       document.querySelector('.top-navbar') || 
                       document.querySelector('header .nav-right-actions');

    if (!navActions) return;

    const esClaro = document.documentElement.classList.contains('light-theme');

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'sigepor-theme-toggle-btn';
    toggleBtn.type = 'button';
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.setAttribute('title', 'Alternar modo claro / oscuro');
    toggleBtn.innerHTML = esClaro ? '☀️ Modo Claro' : '🌙 Modo Oscuro';

    toggleBtn.addEventListener('click', () => {
        const ahoraEsClaro = document.documentElement.classList.toggle('light-theme');
        if (document.body) document.body.classList.toggle('light-theme', ahoraEsClaro);

        const nuevoTema = ahoraEsClaro ? 'light' : 'dark';
        localStorage.setItem('sigepor_theme', nuevoTema);
        toggleBtn.innerHTML = ahoraEsClaro ? '☀️ Modo Claro' : '🌙 Modo Oscuro';

        // Disparar evento personalizado para vistas que tengan gráficos o componentes reactivos
        window.dispatchEvent(new CustomEvent('sigepor-theme-changed', { detail: { theme: nuevoTema } }));
    });

    // Insertar al inicio de las acciones de la barra de navegación
    navActions.insertBefore(toggleBtn, navActions.firstChild);
}

/**
 * Inyecta el Botón Flotante Global de WhatsApp (FAB) en la esquina inferior derecha
 */
function inyectarBotonFlotanteWhatsApp() {
    if (document.getElementById('sigepor-whatsapp-fab')) return;

    // Número de soporte y mensaje predeterminado
    const waNumber = localStorage.getItem('sigepor_wa_number') || '573001234567';
    const waMsg = encodeURIComponent('Hola equipo de soporte SIGEPOR 2026, requiero asistencia técnica con el sistema.');
    const waUrl = `https://wa.me/${+573227112827}?text=${waMsg}`;

    const fabLink = document.createElement('a');
    fabLink.id = 'sigepor-whatsapp-fab';
    fabLink.className = 'whatsapp-fab';
    fabLink.href = waUrl;
    fabLink.target = '_blank';
    fabLink.rel = 'noopener noreferrer';
    fabLink.setAttribute('aria-label', 'Contactar soporte por WhatsApp');

    fabLink.innerHTML = `
        <span class="fab-tooltip">💬 Soporte WhatsApp 24/7</span>
        <svg viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-.974-.055-.498-.158-1.14-.424-1.956-1.149-.974-.864-1.579-1.854-1.83-2.193-.251-.339-.548-.895-.548-1.545 0-.65.34-1.002.498-1.172.158-.17.34-.213.453-.213.113 0 .226.002.327.007.107.006.251-.041.391.295.144.346.49 1.196.533 1.282.043.086.071.187.014.3-.057.114-.085.185-.17.284-.085.1-.179.224-.256.3-.085.085-.174.177-.075.347.099.17.441.728.948 1.179.652.58 1.201.76 1.371.845.17.085.27.071.369-.043.099-.113.424-.495.538-.665.113-.17.227-.142.382-.085.156.057.99.467 1.16.552.17.085.283.128.326.199.043.071.043.411-.101.816z"/>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.054 22l4.98-1.305A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.14 8.14 0 01-4.364-1.258l-.313-.186-2.955.775.789-2.881-.204-.325A8.136 8.136 0 013.818 12c0-4.512 3.67-8.182 8.182-8.182 4.512 0 8.182 3.67 8.182 8.182 0 4.512-3.67 8.182-8.182 8.182z"/>
        </svg>
    `;

    document.body.appendChild(fabLink);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. EXPORTACIÓN GLOBAL E INICIALIZACIÓN AUTOMÁTICA
// ─────────────────────────────────────────────────────────────────────────────

window.checkAuthAndPermissions = checkAuthAndPermissions;
window.obtenerUsuarioSesion = obtenerUsuarioSesion;
window.obtenerRolSesion = obtenerRolSesion;
window.obtenerNombreRol = obtenerNombreRol;
window.aplicarFiltrosDOMPorRol = aplicarFiltrosDOMPorRol;
window.cerrarSesion = cerrarSesion;
window.mostrarToastPendiente = mostrarToastPendiente;
window.aplicarTemaInmediato = aplicarTemaInmediato;
window.inyectarToggleTema = inyectarToggleTema;
window.inyectarBotonFlotanteWhatsApp = inyectarBotonFlotanteWhatsApp;

// Ejecución inmediata para prevenir FOUC si la ruta no está autorizada o el tema es claro
(function inicializacionInmediata() {
    aplicarTemaInmediato();
    checkAuthAndPermissions();
})();

// Re-ejecutar filtros y componentes UI cuando el árbol DOM termine de estructurarse
document.addEventListener('DOMContentLoaded', () => {
    aplicarTemaInmediato();
    aplicarFiltrosDOMPorRol();
    mostrarToastPendiente();
    inyectarToggleTema();
    inyectarBotonFlotanteWhatsApp();
});
