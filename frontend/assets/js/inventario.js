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

// URL para endpoint de lista de proveedores
const API_PROVEEDORES_LISTA = 'http://localhost:3001/api/proveedores_lista';

// Función para obtener el token JWT de la sesión
function obtenerTokenSesionInventario() {
    let token = localStorage.getItem('sigepor_token') || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('sigepor_token') || 
                sessionStorage.getItem('token');

    if (!token) {
        try {
            const u = JSON.parse(localStorage.getItem('usuarioSesion') || localStorage.getItem('usuario_sigepor') || '{}');
            if (u.token) token = u.token;
        } catch (e) {}
    }
    return token;
}

// CARGAR SELECT DESPLEGABLE DE PROVEEDORES (GET /api/proveedores_lista con JWT)
async function cargarProveedoresSelect() {
    const select = document.getElementById('proveedor_id');
    if (!select) return;

    const token = obtenerTokenSesionInventario();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(API_PROVEEDORES_LISTA, { headers });
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || `Error HTTP ${res.status}`);
        }
        const proveedores = await res.json();

        select.innerHTML = '<option value="">Seleccione un proveedor...</option>';
        const lista = Array.isArray(proveedores) ? proveedores : (proveedores.data || []);

        if (lista.length === 0) {
            select.innerHTML = '<option value="">No hay proveedores registrados</option>';
            return;
        }

        lista.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            // Guardar nombre como data-attribute o usar el nombre para alimentar el texto
            const nombreProveedor = p.nombre_proveedor || p.nombre || `Proveedor #${p.id}`;
            option.dataset.nombre = nombreProveedor;
            option.textContent = `🚚 ${nombreProveedor}`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error al cargar proveedores en inventario:', err);
        select.innerHTML = '<option value="">Error al cargar lista de proveedores</option>';
    }
}
// URL para endpoint de lista de corrales
const API_CORRALES = 'http://localhost:3001/api/corrales';

// CARGAR SELECT DESPLEGABLE DE CORRALES (GET /api/corrales con JWT)
async function cargarCorralesSelect() {
    const select = document.getElementById('corral_id');
    if (!select) return;

    const token = localStorage.getItem('sigepor_token') || obtenerTokenSesionInventario();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(API_CORRALES, { headers });
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || `Error HTTP ${res.status}`);
        }
        const corrales = await res.json();

        select.innerHTML = '<option value="">Seleccione un corral...</option>';
        const lista = Array.isArray(corrales) ? corrales : (corrales.data || []);

        if (lista.length === 0) {
            select.innerHTML = '<option value="">No hay corrales registrados</option>';
            return;
        }

        lista.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            const nombreCorral = c.nombre || `Corral #${c.id}`;
            option.dataset.nombre = nombreCorral;
            option.textContent = `🏠 ${nombreCorral} (Cap: ${c.capacidad || 0})`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error al cargar corrales en inventario:', err);
        select.innerHTML = '<option value="">Error al cargar corrales</option>';
    }
}
window.cargarCorralesSelect = cargarCorralesSelect;

if (alimentoForm) {
    alimentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = obtenerTokenSesionInventario();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const selectProveedor = document.getElementById('proveedor_id');
        let nombreProveedor = '';
        if (selectProveedor && selectProveedor.selectedIndex >= 0) {
            const optSeleccionada = selectProveedor.options[selectProveedor.selectedIndex];
            nombreProveedor = optSeleccionada.dataset.nombre || optSeleccionada.textContent.replace('🚚 ', '').trim();
        }

        const selectCorral = document.getElementById('corral_id');
        let nombreCorral = '';
        if (selectCorral && selectCorral.selectedIndex >= 0) {
            const optCorral = selectCorral.options[selectCorral.selectedIndex];
            nombreCorral = optCorral.dataset.nombre || optCorral.textContent.replace('🏠 ', '').split(' (Cap:')[0].trim();
        }

        const datos = {
            id: Date.now(),
            tipo_alimento: document.getElementById('tipo_alimento').value,
            cantidad: parseFloat(document.getElementById('cantidad').value),
            fecha_suministro: document.getElementById('fecha_suministro').value,
            proveedor: nombreProveedor,
            proveedor_id: selectProveedor ? parseInt(selectProveedor.value, 10) : null,
            corral: nombreCorral,
            corral_id: selectCorral ? parseInt(selectCorral.value, 10) : null
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
        const token = obtenerTokenSesionInventario();
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
    cargarProveedoresSelect();
    cargarCorralesSelect();
    cargarInventario();
});
