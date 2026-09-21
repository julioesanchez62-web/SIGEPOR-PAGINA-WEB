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

            if (res.ok || (res.status >= 200 && res.status < 300) || res.status === 404) {
                syncedCount++;
                console.log(`✅ Registro ${req.id} sincronizado exitosamente con MySQL (${req.method} ${urlTarget}).`);
            } else if (res.status >= 500) {
                console.warn(`⚠ Error 5xx del servidor para ${req.id}. Se mantendrá en cola para el próximo intento.`);
                remaining.push(req);
            } else {
                // Errores 4xx permanentes (distintos de 404)
                console.warn(`⚠ Solicitud ${req.id} rechazada por la API (${res.status}). Descartando de la cola.`);
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
 * Renderiza y actualiza la insignia visual permanente de red en la interfaz (UI/UX)
 * @param {boolean} isSyncing Indica si el proceso de sincronización está activo
 */
function renderSyncBadge(isSyncing = false) {
    let badge = document.getElementById('network-sync-badge');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'network-sync-badge';
        badge.style.cssText = `
            position: fixed;
            top: 15px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        document.body.appendChild(badge);
    }

    const isOnline = navigator.onLine;
    const queue = getOfflineQueue();
    const count = queue.length;

    if (isSyncing) {
        badge.style.background = '#feebc8';
        badge.style.color = '#744210';
        badge.style.border = '1px solid #f6ad55';
        badge.innerHTML = `🔄 <span>Sincronizando datos (${count} pendientes)...</span>`;
    } else if (!isOnline) {
        badge.style.background = '#feebc8';
        badge.style.color = '#9c4221';
        badge.style.border = '1px solid #f6ad55';
        badge.innerHTML = `🟠 <span>Sin Conexión / Modo Offline (${count} cambios pendientes)</span>`;
    } else if (count > 0) {
        badge.style.background = '#ebf8ff';
        badge.style.color = '#2b6cb0';
        badge.style.border = '1px solid #63b3ed';
        badge.innerHTML = `⚡ <span>${count} cambios pendientes</span> <button style="border:none; background:#3182ce; color:white; padding:3px 10px; border-radius:12px; cursor:pointer; font-weight:bold; font-size:0.75rem;" onclick="syncPendingData()">Sincronizar Ya</button>`;
    } else {
        badge.style.background = '#c6f6d5';
        badge.style.color = '#22543d';
        badge.style.border = '1px solid #68d391';
        badge.innerHTML = `🟢 <span>Conectado / En Línea</span>`;
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
