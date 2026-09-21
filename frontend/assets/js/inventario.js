/**
 * SIGEPOR - Gestión de Inventarios, Alimentación y Corrales (HU-05 & HU-03 Offline Sync)
 */

const API_INVENTARIO = 'http://localhost:3001/api/inventario';
const LOCAL_KEY_INVENTARIO = 'sigeporInventario';

const alimentoForm = document.getElementById('alimentoForm');
const alimentoTableBody = document.querySelector('#alimentoTable tbody');

async function cargarInventario() {
    let lista = [];
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_INVENTARIO}/alimentos`, { headers });
        if (res.ok) {
            const result = await res.json();
            lista = result.data || [];
            localStorage.setItem(LOCAL_KEY_INVENTARIO, JSON.stringify(lista));
        } else {
            throw new Error('Servidor no disponible');
        }
    } catch (err) {
        console.warn('Cargando inventario desde memoria local (Offline)');
        try {
            const cached = localStorage.getItem(LOCAL_KEY_INVENTARIO);
            lista = cached ? JSON.parse(cached) : [];
        } catch (e) {
            lista = [];
        }
    }

    renderizarTablaAlimentos(lista);
    actualizarStatsAlimento(lista);
}
window.cargarInventario = cargarInventario;

function renderizarTablaAlimentos(lista) {
    if (!alimentoTableBody) return;
    alimentoTableBody.innerHTML = '';

    const tableEmpty = document.getElementById('tableEmpty');

    if (!lista || lista.length === 0) {
        if (tableEmpty) tableEmpty.style.display = 'block';
        return;
    }
    if (tableEmpty) tableEmpty.style.display = 'none';

    lista.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${item.id}</strong></td>
            <td>🌾 ${item.tipo_alimento}</td>
            <td><strong>${item.cantidad} kg</strong></td>
            <td>${item.fecha_suministro}</td>
            <td>🚚 ${item.proveedor || 'General'}</td>
            <td>🏠 ${item.corral || 'General'}</td>
            <td>
                <button style="border:none; background:#fed7d7; color:#9b2c2c; padding:4px 8px; border-radius:5px; cursor:pointer;" onclick="eliminarAlimento(${item.id})">🗑️ Borrar</button>
            </td>
        `;
        alimentoTableBody.appendChild(tr);
    });
}

function actualizarStatsAlimento(lista) {
    const statKilos = document.getElementById('statKilosAlimento');
    if (!statKilos) return;
    const totalKilos = (lista || []).reduce((acc, curr) => acc + (parseFloat(curr.cantidad) || 0), 0);
    statKilos.textContent = totalKilos.toFixed(1) + ' kg';
}

if (alimentoForm) {
    alimentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const datos = {
            id: Date.now(),
            tipo_alimento: document.getElementById('tipo_alimento').value,
            cantidad: parseFloat(document.getElementById('cantidad').value),
            fecha_suministro: document.getElementById('fecha_suministro').value,
            proveedor: document.getElementById('proveedor').value.trim(),
            corral: document.getElementById('corral').value.trim()
        };

        try {
            const res = typeof fetchConFallbackOffline === 'function'
                ? await fetchConFallbackOffline(`${API_INVENTARIO}/alimentos`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(datos)
                })
                : await fetch(`${API_INVENTARIO}/alimentos`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(datos)
                });

            const result = await res.json();

            // Guardado optimista en cache local
            const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_INVENTARIO) || '[]');
            cached.push(datos);
            localStorage.setItem(LOCAL_KEY_INVENTARIO, JSON.stringify(cached));

            if (res.ok || res.offline) {
                alert('🎉 ' + (result.message || 'Alimento guardado correctamente.'));
                alimentoForm.reset();
                cargarInventario();
            } else {
                alert('⚠️ Error: ' + (result.message || 'No se pudo guardar.'));
            }
        } catch (err) {
            console.error(err);
            const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_INVENTARIO) || '[]');
            cached.push(datos);
            localStorage.setItem(LOCAL_KEY_INVENTARIO, JSON.stringify(cached));
            alert('✓ Guardado en modo local.');
            alimentoForm.reset();
            cargarInventario();
        }
    });
}

async function eliminarAlimento(id) {
    if (window.obtenerRolSesion && window.obtenerRolSesion() === 2) {
        alert('Acceso Denegado: El rol Operario / Empleado no tiene permisos para eliminar registros.');
        return;
    }
    if (!confirm('¿Eliminar registro de alimento?')) return;
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = typeof fetchConFallbackOffline === 'function'
            ? await fetchConFallbackOffline(`${API_INVENTARIO}/alimentos/${id}`, { method: 'DELETE', headers })
            : await fetch(`${API_INVENTARIO}/alimentos/${id}`, { method: 'DELETE', headers });

        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_INVENTARIO) || '[]');
        const filtrados = cached.filter(i => Number(i.id) !== Number(id));
        localStorage.setItem(LOCAL_KEY_INVENTARIO, JSON.stringify(filtrados));

        alert('🗑️ Registro eliminado.');
        cargarInventario();
    } catch (err) {
        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_INVENTARIO) || '[]');
        const filtrados = cached.filter(i => Number(i.id) !== Number(id));
        localStorage.setItem(LOCAL_KEY_INVENTARIO, JSON.stringify(filtrados));
        alert('🗑️ Registro eliminado en caché local.');
        cargarInventario();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
});
