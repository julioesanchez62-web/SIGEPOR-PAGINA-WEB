/**
 * SIGEPOR - Gestión de Inventarios, Alimentación y Corrales (HU-05)
 */

const API_INVENTARIO = 'http://localhost:3001/api/inventario';

const alimentoForm = document.getElementById('alimentoForm');
const alimentoTableBody = document.querySelector('#alimentoTable tbody');

async function cargarInventario() {
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_INVENTARIO}/alimentos`, { headers });
        const result = await res.json();

        if (res.ok && result.data) {
            renderizarTablaAlimentos(result.data);
            if (document.getElementById('statKilosAlimento')) {
                document.getElementById('statKilosAlimento').textContent = (result.stats.totalKilos || 0).toFixed(1) + ' kg';
            }
        }
    } catch (err) {
        console.error(err);
    }
}

function renderizarTablaAlimentos(lista) {
    if (!alimentoTableBody) return;
    alimentoTableBody.innerHTML = '';

    if (!lista || lista.length === 0) {
        document.getElementById('tableEmpty').style.display = 'block';
        return;
    }
    document.getElementById('tableEmpty').style.display = 'none';

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

if (alimentoForm) {
    alimentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const datos = {
            tipo_alimento: document.getElementById('tipo_alimento').value,
            cantidad: parseFloat(document.getElementById('cantidad').value),
            fecha_suministro: document.getElementById('fecha_suministro').value,
            proveedor: document.getElementById('proveedor').value.trim(),
            corral: document.getElementById('corral').value.trim()
        };

        try {
            const res = await fetch(`${API_INVENTARIO}/alimentos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(datos)
            });
            const result = await res.json();
            if (res.ok) {
                alert('🎉 ' + result.message);
                alimentoForm.reset();
                cargarInventario();
            } else {
                alert('⚠️ Error: ' + (result.message || 'No se pudo guardar.'));
            }
        } catch (err) {
            alert('❌ Error de comunicación.');
        }
    });
}

async function eliminarAlimento(id) {
    if (!confirm('¿Eliminar registro de alimento?')) return;
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_INVENTARIO}/alimentos/${id}`, { method: 'DELETE', headers });
        if (res.ok) {
            alert('🗑️ Registro eliminado.');
            cargarInventario();
        }
    } catch (err) {
        alert('❌ Error al eliminar.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
});
