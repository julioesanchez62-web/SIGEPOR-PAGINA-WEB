/**
 * SIGEPOR - Gestor de Sincronización Offline/Online Bidireccional (HU-03)
 */

const OFFLINE_QUEUE_KEY = 'sigepor_offline_queue';

function getOfflineQueue() {
    try {
        const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch (e) {
        return [];
    }
}

function saveOfflineQueue(queue) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

function enqueueOfflineRequest(url, method, body, headers = {}) {
    const queue = getOfflineQueue();
    queue.push({
        id: Date.now(),
        url,
        method: (method || 'GET').toUpperCase(),
        body: typeof body === 'string' ? JSON.parse(body) : body,
        headers,
        timestamp: new Date().toISOString()
    });
    saveOfflineQueue(queue);
    renderSyncBadge();
}

async function processOfflineQueue() {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`🔄 Procesando ${queue.length} solicitudes pendientes en la cola offline...`);
    renderSyncBadge(true);

    const remaining = [];
    let syncedCount = 0;

    for (const req of queue) {
        try {
            const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...req.headers
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(req.url, {
                method: req.method,
                headers,
                body: req.body ? JSON.stringify(req.body) : undefined
            });

            if (res.ok || (res.status >= 200 && res.status < 300) || res.status === 404) {
                syncedCount++;
            } else if (res.status >= 500) {
                remaining.push(req); // Si falla por servidor 5xx, mantener en cola para reintento
            }
        } catch (err) {
            remaining.push(req); // Error de conexión de red, mantener en cola
        }
    }

    saveOfflineQueue(remaining);
    renderSyncBadge();

    if (syncedCount > 0) {
        console.log(`✅ ¡${syncedCount} cambios locales sincronizados con MySQL!`);
        refrescarUIActual();
    }
}

function refrescarUIActual() {
    if (typeof window.cargarPorcinos === 'function') window.cargarPorcinos();
    if (typeof window.cargarVacunas === 'function') window.cargarVacunas();
    if (typeof window.cargarInventario === 'function') window.cargarInventario();
    if (typeof window.cargarEventosReproductivos === 'function') window.cargarEventosReproductivos();
    if (typeof window.cargarVeterinarios === 'function') window.cargarVeterinarios();
    if (typeof window.cargarUsuarios === 'function') window.cargarUsuarios();
    if (typeof window.cargarAlertasSistema === 'function') window.cargarAlertasSistema();
}

function renderSyncBadge(isSyncing = false) {
    let badge = document.getElementById('network-sync-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'network-sync-badge';
        badge.style.cssText = `
            position: fixed;
            bottom: 15px;
            right: 15px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(badge);
    }

    const isOnline = navigator.onLine;
    const queue = getOfflineQueue();

    if (isSyncing) {
        badge.style.background = '#feebc8';
        badge.style.color = '#744210';
        badge.innerHTML = `🔄 <span>Sincronizando ${queue.length} registros con el servidor...</span>`;
    } else if (!isOnline) {
        badge.style.background = '#fed7d7';
        badge.style.color = '#742a2a';
        badge.innerHTML = `🟠 <span>Modo Offline (${queue.length} guardados localmente)</span>`;
    } else if (queue.length > 0) {
        badge.style.background = '#ebf8ff';
        badge.style.color = '#2b6cb0';
        badge.innerHTML = `⚡ <span>${queue.length} pendientes por sincronizar</span> <button style="border:none; background:#3182ce; color:white; padding:2px 8px; border-radius:10px; cursor:pointer;" onclick="processOfflineQueue()">Sincronizar Ya</button>`;
    } else {
        badge.style.background = '#c6f6d5';
        badge.style.color = '#22543d';
        badge.innerHTML = `🟢 <span>En línea (Conectado a MySQL)</span>`;
    }
}

// Escuchadores de estado de red
window.addEventListener('online', () => {
    renderSyncBadge();
    processOfflineQueue();
});

window.addEventListener('offline', () => {
    renderSyncBadge();
});

document.addEventListener('DOMContentLoaded', () => {
    renderSyncBadge();
    if (navigator.onLine) {
        processOfflineQueue();
    }
});

// Función de fetch con fallback offline para mutaciones (POST, PUT, DELETE)
async function fetchConFallbackOffline(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();

    if (!navigator.onLine) {
        if (method !== 'GET') {
            enqueueOfflineRequest(url, method, options.body, options.headers);
        }
        return {
            ok: true,
            offline: true,
            json: async () => ({ status: 'offline', message: 'Guardado en modo local. Se sincronizará con MySQL al reconectarse.' })
        };
    }

    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        if (method !== 'GET') {
            enqueueOfflineRequest(url, method, options.body, options.headers);
            return {
                ok: true,
                offline: true,
                json: async () => ({ status: 'offline', message: 'Sin comunicación con el servidor. Guardado en cola local.' })
            };
        }
        throw error;
    }
}

// Exportar globalmente
window.getOfflineQueue = getOfflineQueue;
window.saveOfflineQueue = saveOfflineQueue;
window.enqueueOfflineRequest = enqueueOfflineRequest;
window.processOfflineQueue = processOfflineQueue;
window.fetchConFallbackOffline = fetchConFallbackOffline;
window.refrescarUIActual = refrescarUIActual;
