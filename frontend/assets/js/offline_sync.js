/**
 * SIGEPOR - Gestor de Sincronización Offline/Online (HU-03)
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
        method,
        body,
        headers,
        timestamp: new Date().toISOString()
    });
    saveOfflineQueue(queue);
    renderSyncBadge();
}

async function processOfflineQueue() {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`🔄 Procesando ${queue.length} registros pendientes en cola offline...`);
    renderSyncBadge(true);

    const remaining = [];
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
                body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
            });

            if (!res.ok && res.status >= 500) {
                remaining.push(req); // Si falla por servidor, mantener en cola
            }
        } catch (err) {
            remaining.push(req); // Error de red, mantener
        }
    }

    saveOfflineQueue(remaining);
    renderSyncBadge();
    if (remaining.length === 0) {
        if (typeof window.cargarDatosPantalla === 'function') window.cargarDatosPantalla();
        if (typeof window.cargarPorcinos === 'function') window.cargarPorcinos();
        if (typeof window.cargarVacunas === 'function') window.cargarVacunas();
        alert('🎉 ¡Sincronización completada! Todos los registros locales guardados en la base de datos MySQL.');
    }
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
        badge.innerHTML = `🟠 <span>Modo Offline (${queue.length} guardados en espera)</span>`;
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

// Función de fetch con fallback offline
async function fetchConFallbackOffline(url, options = {}) {
    if (!navigator.onLine) {
        enqueueOfflineRequest(url, options.method || 'GET', options.body);
        return {
            ok: true,
            offline: true,
            json: async () => ({ status: 'offline', message: 'Guardado localmente. Se sincronizará al reconectarse.' })
        };
    }

    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        if (options.method && options.method !== 'GET') {
            enqueueOfflineRequest(url, options.method, options.body);
            return {
                ok: true,
                offline: true,
                json: async () => ({ status: 'offline', message: 'Sin conexión con el servidor. Guardado en cola local.' })
            };
        }
        throw error;
    }
}
