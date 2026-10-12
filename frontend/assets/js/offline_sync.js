/**
 * SIGEPOR - Gestor de Sincronización Offline/Online Bidireccional (HU-03)
 * Administra la cola de peticiones pendientes (pending_sync_queue), el indicador visual de red
 * y la sincronización automática al restablecer la conexión con MySQL.
 */

const PENDING_SYNC_QUEUE_KEY = 'pending_sync_queue';
const LEGACY_OFFLINE_QUEUE_KEY = 'sigepor_offline_queue';

/**
 * Obtiene la cola de peticiones pendientes de sincronización local
 * @returns {Array} Lista de peticiones pendientes
 */
function getOfflineQueue() {
    try {
        const queueStr = localStorage.getItem(PENDING_SYNC_QUEUE_KEY) || localStorage.getItem(LEGACY_OFFLINE_QUEUE_KEY);
        return queueStr ? JSON.parse(queueStr) : [];
    } catch (e) {
        console.error('Error leyendo la cola offline:', e);
        return [];
    }
}

/**
 * Guarda la cola de peticiones pendientes en localStorage
 * @param {Array} queue Lista de peticiones a guardar
 */
function saveOfflineQueue(queue) {
    try {
        localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(queue));
        localStorage.setItem(LEGACY_OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error('Error guardando la cola offline en localStorage:', e);
    }
}

/**
 * Obtiene el rol activo del usuario desde la sesión almacenada
 * @returns {number} ID del rol del usuario (1: Admin, 2: Operario, 3: Veterinario)
 */
function obtenerRolUsuarioActivo() {
    try {
        if (typeof window.obtenerRolSesion === 'function') {
            return window.obtenerRolSesion() || 2;
        }
        const sesionStr = localStorage.getItem('usuario_sigepor') || 
                          localStorage.getItem('usuarioSesion') ||
                          sessionStorage.getItem('usuario_sigepor');
        if (sesionStr) {
            const user = JSON.parse(sesionStr);
            return Number(user.idRol || user.rol || user.roleId || 2);
        }
    } catch (e) {}
    return 2; // Por defecto Operario
}

/**
 * Valida si el rol activo tiene permisos para encolar la acción en modo offline
 * @param {string} method Método HTTP ('POST', 'PUT', 'DELETE')
 * @returns {boolean} True si tiene permisos, False en caso contrario
 */
function validarPermisoRolOffline(method) {
    const rol = obtenerRolUsuarioActivo();
    const m = (method || 'GET').toUpperCase();

    // Rol 2 (Operario): No tiene permitido eliminar (DELETE)
    if (rol === 2 && m === 'DELETE') {
        alert('Acceso Denegado: Tu rol de Operario no tiene permisos para eliminar registros, ni siquiera en modo offline.');
        return false;
    }

    return true;
}

/**
 * Encola una petición para sincronización posterior con la API/MySQL
 * @param {string} endpoint URL del endpoint
 * @param {string} method Método HTTP ('POST', 'PUT', 'DELETE')
 * @param {Object|string} payload Datos del cuerpo de la petición
 * @param {Object} headers Encabezados adicionales
 * @returns {boolean} Éxito al encolar
 */
function enqueueOfflineRequest(endpoint, method, payload, headers = {}) {
    const m = (method || 'GET').toUpperCase();

    if (!validarPermisoRolOffline(m)) {
        return false;
    }

    const queue = getOfflineQueue();
    const rol = obtenerRolUsuarioActivo();

    const newRequest = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        endpoint: endpoint,
        url: endpoint, // Compatibilidad
        method: m,
        payload: typeof payload === 'string' ? JSON.parse(payload) : payload,
        body: typeof payload === 'string' ? JSON.parse(payload) : payload, // Compatibilidad
        timestamp: new Date().toISOString(),
        role: rol,
        headers: headers
    };

    queue.push(newRequest);
    saveOfflineQueue(queue);
    renderSyncBadge();
    return true;
}

/**
 * Procesa secuencialmente (FIFO) la cola de peticiones pendientes enviándolas a la API/MySQL
 */
async function syncPendingData() {
    const queue = getOfflineQueue();
    if (!queue || queue.length === 0) {
        renderSyncBadge();
        return;
    }

    console.log(`🔄 Sincronizando ${queue.length} modificaciones pendientes con la base de datos MySQL...`);
    renderSyncBadge(true);

    const remaining = [];
    let syncedCount = 0;

    for (const req of queue) {
        try {
            const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
            const reqHeaders = {
                'Content-Type': 'application/json',
                ...(req.headers || {})
            };
            if (token) reqHeaders['Authorization'] = `Bearer ${token}`;

            const urlTarget = req.endpoint || req.url;
            const res = await fetch(urlTarget, {
                method: req.method,
                headers: reqHeaders,
                body: req.payload || req.body ? JSON.stringify(req.payload || req.body) : undefined
            });

            // REGLA ESTRICTA: Solo códigos 2xx (200-299) se consideran éxito
            if (res.ok && res.status >= 200 && res.status < 300) {
                syncedCount++;
                console.log(`✅ Registro ${req.id} sincronizado exitosamente con MySQL (${req.method} ${urlTarget}).`);
            } else if (res.status >= 500) {
                console.error(`💥 Error 5xx del servidor backend para ${req.id}. Se mantiene en cola para reintento.`);
                remaining.push(req);
            } else {
                // Errores 4xx (400, 401, 403, 404, etc.): La API rechazó explícitamente la transacción
                // NUNCA validar como éxito ni persistir en la vista. Se descarta de la cola.
                console.warn(`⛔ Solicitud ${req.id} rechazada por la API (HTTP ${res.status}). Descartando de la cola sin persistir.`);
            }
        } catch (err) {
            console.warn(`📡 Red inaccesible al intentar sincronizar elemento ${req.id}. Se mantiene en cola.`, err);
            remaining.push(req);
        }
    }

    saveOfflineQueue(remaining);
    renderSyncBadge();

    if (syncedCount > 0) {
        console.log(`🎉 ¡Sincronización completada! ${syncedCount} cambios integrados a MySQL.`);
        mostrarNotificacionSync(`Sincronización completada con éxito. ${syncedCount} cambio(s) guardados en MySQL.`);
        refrescarUIActual();
    }
}

// Alias para compatibilidad con código existente
const processOfflineQueue = syncPendingData;

/**
 * Refresca la información visual de las tablas y estadísticas de la página actual
 */
function refrescarUIActual() {
    if (typeof window.cargarPorcinos === 'function') window.cargarPorcinos();
    if (typeof window.cargarVacunas === 'function') window.cargarVacunas();
    if (typeof window.cargarInventario === 'function') window.cargarInventario();
    if (typeof window.cargarEventosReproductivos === 'function') window.cargarEventosReproductivos();
    if (typeof window.cargarVeterinarios === 'function') window.cargarVeterinarios();
    if (typeof window.cargarUsuarios === 'function') window.cargarUsuarios();
    if (typeof window.cargarAlertasSistema === 'function') window.cargarAlertasSistema();
}

/**
 * Renderiza y actualiza el único indicador visual de red en la barra superior (#syncStatus)
 * @param {boolean} isSyncing Indica si el proceso de sincronización está activo
 */
function renderSyncBadge(isSyncing = false) {
    // Si existía un badge redundante flotante creado previamente, eliminarlo
    const legacyBadge = document.getElementById('network-sync-badge');
    if (legacyBadge) {
        legacyBadge.remove();
    }

    const badge = document.getElementById('syncStatus');
    if (!badge) return;

    const isOnline = navigator.onLine;
    const queue = getOfflineQueue();
    const count = queue.length;

    if (isSyncing) {
        badge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        badge.style.background = 'rgba(245, 158, 11, 0.15)';
        badge.style.color = '#fbbf24';
        badge.innerHTML = `
            <div class="pulse-dot" style="background:#fbbf24; box-shadow:0 0 10px #fbbf24;"></div>
            <span>Sincronizando (${count} pendientes)...</span>
        `;
    } else if (!isOnline) {
        badge.style.borderColor = 'rgba(239, 68, 68, 0.45)';
        badge.style.background = 'rgba(239, 68, 68, 0.15)';
        badge.style.color = '#f87171';
        badge.innerHTML = `
            <div class="pulse-dot" style="background:#ef4444; box-shadow:0 0 10px #ef4444;"></div>
            <span>Fuera de línea - ${count} modificaciones pendientes</span>
        `;
    } else if (count > 0) {
        badge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        badge.style.background = 'rgba(245, 158, 11, 0.15)';
        badge.style.color = '#fbbf24';
        badge.innerHTML = `
            <div class="pulse-dot" style="background:#f59e0b; box-shadow:0 0 10px #f59e0b;"></div>
            <span>En línea - ${count} pendientes por guardar</span>
        `;
    } else {
        badge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
        badge.style.background = 'rgba(16, 185, 129, 0.12)';
        badge.style.color = 'var(--primary-emerald, #10b981)';
        badge.innerHTML = `
            <div class="pulse-dot" style="background:var(--primary-emerald, #10b981); box-shadow:0 0 10px var(--primary-emerald, #10b981);"></div>
            <span>Inventario Activo • MySQL</span>
        `;
    }
}

/**
 * Muestra una notificación emergente visual cuando se completa la sincronización
 * @param {string} mensaje Mensaje a mostrar
 */
function mostrarNotificacionSync(mensaje) {
    let notif = document.getElementById('sync-toast-notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'sync-toast-notification';
        notif.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2f855a;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.25);
            z-index: 99999;
            transition: opacity 0.4s ease;
        `;
        document.body.appendChild(notif);
    }
    notif.innerHTML = `✅ ${mensaje}`;
    notif.style.opacity = '1';
    notif.style.display = 'block';

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => { notif.style.display = 'none'; }, 400);
    }, 4000);
}

/**
 * Intercepta peticiones fetch para soportar fallback offline en mutaciones (POST, PUT, DELETE)
 * @param {string} url URL de la API
 * @param {Object} options Opciones de la petición fetch
 * @returns {Promise<Object>} Objeto respuesta o simulación offline
 */
async function fetchConFallbackOffline(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();

    // 1. Si no hay conexión a internet y es una modificación
    if (!navigator.onLine) {
        if (method !== 'GET') {
            const ok = enqueueOfflineRequest(url, method, options.body, options.headers);
            if (!ok) {
                return {
                    ok: false,
                    offline: true,
                    json: async () => ({ status: 'error', message: 'Permiso denegado para esta acción.' })
                };
            }
        }
        return {
            ok: true,
            offline: true,
            json: async () => ({ status: 'offline', message: 'Guardado localmente en modo offline. Se sincronizará con MySQL al reconectarse.' })
        };
    }

    // 2. Intentar petición con el servidor si estamos en línea
    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        console.warn('Fallo de red durante la petición. Guardando en la cola offline:', error.message);
        if (method !== 'GET') {
            const ok = enqueueOfflineRequest(url, method, options.body, options.headers);
            if (!ok) {
                return {
                    ok: false,
                    offline: true,
                    json: async () => ({ status: 'error', message: 'Permiso denegado para esta acción.' })
                };
            }
            return {
                ok: true,
                offline: true,
                json: async () => ({ status: 'offline', message: 'Servidor inaccesible. Guardado en la cola local de pendientes.' })
            };
        }
        throw error;
    }
}

// Escuchadores de eventos de la ventana de red
window.addEventListener('online', () => {
    renderSyncBadge();
    syncPendingData();
});

window.addEventListener('offline', () => {
    renderSyncBadge();
});

document.addEventListener('DOMContentLoaded', () => {
    renderSyncBadge();
    if (navigator.onLine) {
        syncPendingData();
    }
});

// Exportaciones globales para el proyecto
window.getOfflineQueue = getOfflineQueue;
window.saveOfflineQueue = saveOfflineQueue;
window.enqueueOfflineRequest = enqueueOfflineRequest;
window.syncPendingData = syncPendingData;
window.processOfflineQueue = processOfflineQueue;
window.fetchConFallbackOffline = fetchConFallbackOffline;
window.refrescarUIActual = refrescarUIActual;
window.renderSyncBadge = renderSyncBadge;
