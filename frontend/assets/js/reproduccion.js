/**
 * SIGEPOR - Gestión de Eventos Reproductivos (HU-02)
 */

const API_REPRODUCCION = 'http://localhost:3001/api/reproduccion';
const API_PORCINOS = 'http://localhost:3001/api/porcinos';

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
    try {
        const res = await fetch(API_PORCINOS);
        const result = await res.json();
        if (res.ok && result.data) {
            selectPorcino.innerHTML = '<option value="">Seleccione Cerda / Porcino</option>';
            result.data.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `🐷 #${p.id} (${p.identificacion || p.id}) - ${p.raza} (${p.genero || 'Hembra'})`;
                selectPorcino.appendChild(opt);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function cargarEventosReproductivos() {
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(API_REPRODUCCION, { headers });
        const result = await res.json();

        if (res.ok && result.data) {
            renderizarTablaRepro(result.data);
            actualizarStatsRepro(result.stats || {});
        }
    } catch (err) {
        console.error(err);
    }
}

function renderizarTablaRepro(lista) {
    if (!reproTableBody) return;
    reproTableBody.innerHTML = '';

    if (!lista || lista.length === 0) {
        document.getElementById('tableEmpty').style.display = 'block';
        return;
    }
    document.getElementById('tableEmpty').style.display = 'none';

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

function actualizarStatsRepro(stats) {
    if (document.getElementById('statTotalRepro')) document.getElementById('statTotalRepro').textContent = stats.total || 0;
    if (document.getElementById('statCubriciones')) document.getElementById('statCubriciones').textContent = stats.cubriciones || 0;
    if (document.getElementById('statPartos')) document.getElementById('statPartos').textContent = stats.partos || 0;
    if (document.getElementById('statDestetes')) document.getElementById('statDestetes').textContent = stats.destetes || 0;
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
            porcino_id: porcinoVal,
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

            if (res.ok) {
                alert('🎉 ' + (result.message || 'Evento reproductivo registrado con éxito en MySQL.'));
                reproForm.reset();
                cargarEventosReproductivos();
            } else {
                alert('⚠️ Error: ' + (result.message || 'No se pudo guardar el evento.'));
            }
        } catch (err) {
            console.error('Error enviando evento reproductivo:', err);
            alert('❌ Error de comunicación con el servidor SIGEPOR (http://localhost:3001). Verifique que el backend esté iniciado con `npm start`.');
        }
    });
}

async function eliminarEventoRepro(id) {
    if (!confirm('¿Eliminar este registro reproductivo?')) return;
    try {
        const token = localStorage.getItem('sigepor_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_REPRODUCCION}/${id}`, { method: 'DELETE', headers });
        const result = await res.json();
        if (res.ok) {
            alert('🗑️ ' + result.message);
            cargarEventosReproductivos();
        }
    } catch (err) {
        alert('❌ Error al eliminar.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPorcinosHembra();
    cargarEventosReproductivos();
});
