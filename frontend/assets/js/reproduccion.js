/**
 * SIGEPOR - Gestión de Eventos Reproductivos (HU-02 & HU-03 Offline Sync)
 */

const API_REPRODUCCION = 'http://localhost:3001/api/reproduccion';
const API_PORCINOS = 'http://localhost:3001/api/porcinos';
const LOCAL_KEY_REPRODUCCION = 'sigeporReproduccion';

const reproForm = document.getElementById('reproForm');
const selectPorcino = document.getElementById('porcino_id');
const selectTipoEvento = document.getElementById('tipo_evento');
const inputFechaEvento = document.getElementById('fecha_evento');
const inputFechaParto = document.getElementById('fecha_probable_parto');
const inputLechones = document.getElementById('lechones_nacidos');
const inputObservaciones = document.getElementById('observaciones');
const reproTableBody = document.querySelector('#reproTable tbody');

async function cargarPorcinosHembra() {
    if (!selectPorcino) return;
    let lista = [];
    try {
        const res = await fetch(API_PORCINOS);
        if (res.ok) {
            const result = await res.json();
            lista = result.data || [];
            localStorage.setItem('sigeporPigs', JSON.stringify(lista));
        } else {
            throw new Error('Sin red');
        }
    } catch (err) {
        const cached = localStorage.getItem('sigeporPigs');
        lista = cached ? JSON.parse(cached) : [];
    }

    selectPorcino.innerHTML = '<option value="">Seleccione Cerda / Porcino</option>';
    lista.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `🐷 #${p.id} (${p.identificacion || p.id}) - ${p.raza || p.breed || ''} (${p.genero || 'Hembra'})`;
        selectPorcino.appendChild(opt);
    });
}

async function cargarEventosReproductivos() {
    let lista = [];
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(API_REPRODUCCION, { headers });
        if (res.ok) {
            const result = await res.json();
            lista = result.data || [];
            localStorage.setItem(LOCAL_KEY_REPRODUCCION, JSON.stringify(lista));
        } else {
            throw new Error('Servidor offline');
        }
    } catch (err) {
        console.warn('Cargando eventos reproductivos desde memoria local');
        try {
            const cached = localStorage.getItem(LOCAL_KEY_REPRODUCCION);
            lista = cached ? JSON.parse(cached) : [];
        } catch (e) {
            lista = [];
        }
    }

    renderizarTablaRepro(lista);
    actualizarStatsReproCalculadas(lista);
}
window.cargarEventosReproductivos = cargarEventosReproductivos;

function renderizarTablaRepro(lista) {
    if (!reproTableBody) return;
    reproTableBody.innerHTML = '';

    const tableEmpty = document.getElementById('tableEmpty');

    if (!lista || lista.length === 0) {
        if (tableEmpty) tableEmpty.style.display = 'block';
        return;
    }
    if (tableEmpty) tableEmpty.style.display = 'none';

    lista.forEach(item => {
        const tr = document.createElement('tr');
        let badge = `<span style="padding:3px 8px; border-radius:10px; font-weight:bold; background:#e2e8f0;">${item.tipo_evento}</span>`;
        if (item.tipo_evento === 'Cubrición') badge = `<span style="padding:3px 8px; border-radius:10px; font-weight:bold; background:#feebc8; color:#744210;">💘 Cubrición</span>`;
        if (item.tipo_evento === 'Parto') badge = `<span style="padding:3px 8px; border-radius:10px; font-weight:bold; background:#c6f6d5; color:#22543d;">🍼 Parto (${item.lechones_nacidos} lechones)</span>`;
        if (item.tipo_evento === 'Destete') badge = `<span style="padding:3px 8px; border-radius:10px; font-weight:bold; background:#e9d8fd; color:#44337a;">🐖 Destete</span>`;

        tr.innerHTML = `
            <td><strong>#${item.porcino_id} (${item.porcino_codigo || item.porcino_id})</strong></td>
            <td>${badge}</td>
            <td>${item.fecha_evento}</td>
            <td>${item.fecha_probable_parto ? `📅 ${item.fecha_probable_parto}` : '-'}</td>
            <td>${item.lechones_nacidos || 0}</td>
            <td>${item.observaciones || '-'}</td>
            <td>
                <button style="border:none; background:#fed7d7; color:#9b2c2c; padding:4px 8px; border-radius:5px; cursor:pointer;" onclick="eliminarEventoRepro(${item.id})">🗑️ Borrar</button>
            </td>
        `;
        reproTableBody.appendChild(tr);
    });
}

function actualizarStatsReproCalculadas(lista) {
    const list = Array.isArray(lista) ? lista : [];
    const total = list.length;
    const cubriciones = list.filter(i => i.tipo_evento === 'Cubrición').length;
    const partos = list.filter(i => i.tipo_evento === 'Parto').length;
    const destetes = list.filter(i => i.tipo_evento === 'Destete').length;

    if (document.getElementById('statTotalRepro')) document.getElementById('statTotalRepro').textContent = total;
    if (document.getElementById('statCubriciones')) document.getElementById('statCubriciones').textContent = cubriciones;
    if (document.getElementById('statPartos')) document.getElementById('statPartos').textContent = partos;
    if (document.getElementById('statDestetes')) document.getElementById('statDestetes').textContent = destetes;
}

if (reproForm) {
    reproForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const porcinoVal = selectPorcino.value;
        if (!porcinoVal) {
            alert('⚠️ Por favor seleccione una cerda / porcino de la lista.');
            return;
        }

        const datos = {
            id: Date.now(),
            porcino_id: porcinoVal,
            porcino_codigo: porcinoVal,
            tipo_evento: selectTipoEvento.value,
            fecha_evento: inputFechaEvento.value,
            fecha_probable_parto: inputFechaParto.value || undefined,
            lechones_nacidos: parseInt(inputLechones.value || 0, 10),
            observaciones: inputObservaciones.value.trim()
        };

        try {
            const res = typeof fetchConFallbackOffline === 'function'
                ? await fetchConFallbackOffline(API_REPRODUCCION, { method: 'POST', headers, body: JSON.stringify(datos) })
                : await fetch(API_REPRODUCCION, { method: 'POST', headers, body: JSON.stringify(datos) });

            const result = await res.json();

            // Guardar en cache local siempre
            const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_REPRODUCCION) || '[]');
            cached.push(datos);
            localStorage.setItem(LOCAL_KEY_REPRODUCCION, JSON.stringify(cached));

            if (res.ok || res.offline) {
                alert('🎉 ' + (result.message || 'Evento reproductivo registrado con éxito.'));
                reproForm.reset();
                cargarEventosReproductivos();
            } else {
                alert('⚠️ Error: ' + (result.message || 'No se pudo guardar el evento.'));
            }
        } catch (err) {
            console.error('Error enviando evento reproductivo:', err);
            const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_REPRODUCCION) || '[]');
            cached.push(datos);
            localStorage.setItem(LOCAL_KEY_REPRODUCCION, JSON.stringify(cached));
            alert('✓ Guardado en modo local.');
            reproForm.reset();
            cargarEventosReproductivos();
        }
    });
}

async function eliminarEventoRepro(id) {
    if (!confirm('¿Eliminar este registro reproductivo?')) return;
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = typeof fetchConFallbackOffline === 'function'
            ? await fetchConFallbackOffline(`${API_REPRODUCCION}/${id}`, { method: 'DELETE', headers })
            : await fetch(`${API_REPRODUCCION}/${id}`, { method: 'DELETE', headers });

        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_REPRODUCCION) || '[]');
        const filtrados = cached.filter(i => Number(i.id) !== Number(id));
        localStorage.setItem(LOCAL_KEY_REPRODUCCION, JSON.stringify(filtrados));

        alert('🗑️ Registro eliminado.');
        cargarEventosReproductivos();
    } catch (err) {
        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_REPRODUCCION) || '[]');
        const filtrados = cached.filter(i => Number(i.id) !== Number(id));
        localStorage.setItem(LOCAL_KEY_REPRODUCCION, JSON.stringify(filtrados));
        alert('🗑️ Registro eliminado en caché local.');
        cargarEventosReproductivos();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPorcinosHembra();
    cargarEventosReproductivos();
});
