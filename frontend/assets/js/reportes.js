/**
 * SIGEPOR - Centro de Alertas, Reportes Exportables (CSV/JSON) y Trazabilidad (HU-07 a HU-10 & HU-03 Offline Sync)
 */

const API_REPORTES = 'http://localhost:3001/api/reportes';

async function cargarAlertasSistema() {
    try {
        const token = obtenerTokenAutenticado();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_REPORTES}/alertas`, { headers });
        if (res.ok) {
            const result = await res.json();
            if (result.data) {
                renderizarAlertas(result.data);
                return;
            }
        }
    } catch (err) {
        console.warn('Generando alertas a partir de datos locales...');
    }

    // Fallback Offline: Calcular alertas desde caché local
    const pigs = JSON.parse(localStorage.getItem('sigeporPigs') || '[]');
    const vacunas = JSON.parse(localStorage.getItem('sigeporVaccines') || '[]');
    const repro = JSON.parse(localStorage.getItem('sigeporReproduccion') || '[]');

    const saludAlerts = pigs.filter(p => (p.estado_salud || p.health) === 'En Observación' || (p.estado_salud || p.health) === 'Enfermo');
    const reproAlerts = repro.filter(r => r.tipo_evento === 'Cubrición' && r.fecha_probable_parto);
    const vacunasAlerts = vacunas.filter(v => (v.estado || v.vaccineStatus) === 'Pendiente' || (v.estado || v.vaccineStatus) === 'Retrasada');

    renderizarAlertas({
        salud: saludAlerts,
        reproduccion: reproAlerts,
        vacunacion: vacunasAlerts
    });
}
window.cargarAlertasSistema = cargarAlertasSistema;

function renderizarAlertas(alertas) {
    const alertBox = document.getElementById('alertsContainer');
    if (!alertBox) return;

    alertBox.innerHTML = '';

    const { salud, reproduccion, vacunacion } = alertas || {};

    if ((!salud || salud.length === 0) && (!reproduccion || reproduccion.length === 0) && (!vacunacion || vacunacion.length === 0)) {
        alertBox.innerHTML = `
            <div class="clinical-alert-card clinical-alert-ok" style="font-weight: 600; display: flex; flex-direction: row; align-items: center; gap: 8px;">
                <span style="font-size: 1.25rem;">🎉</span>
                <span>¡Todo en orden! No hay alertas sanitarias ni reproductivas pendientes en la granja.</span>
            </div>
        `;
        return;
    }

    // 1. Alertas de salud (rojas): Fondo oscuro con tinte rojo + borde rojo brillante + texto blanco/claro
    if (salud && salud.length > 0) {
        salud.forEach(p => {
            const pigId = p.id_porcino || p.id;
            alertBox.innerHTML += `
                <div class="clinical-alert-card clinical-alert-salud">
                    <div>
                        <strong style="color: #fca5a5; display: inline-flex; align-items: center; gap: 5px;">🏥 Atención Sanitaria:</strong> 
                        Porcino <span style="color: #ffffff; font-weight: 700;">#${pigId}</span> (${p.identificacion || pigId}) raza ${p.raza || p.breed || 'Sin especificar'} se encuentra en estado 
                        <strong style="color: #f87171; background: rgba(239, 68, 68, 0.25); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.4); font-weight: 700;">'${p.estado_salud || p.health}'</strong>.
                    </div>
                </div>
            `;
        });
    }

    // 2. Partos próximos (amarillas/naranjas): Fondo oscuro con tinte amarillo + borde amarillo brillante + texto blanco/claro
    if (reproduccion && reproduccion.length > 0) {
        reproduccion.forEach(r => {
            const pigId = r.id_porcino || r.porcino_id;
            alertBox.innerHTML += `
                <div class="clinical-alert-card clinical-alert-repro">
                    <div>
                        <strong style="color: #fde68a; display: inline-flex; align-items: center; gap: 5px;">🍼 Parto Próximo:</strong> 
                        Porcino <span style="color: #ffffff; font-weight: 700;">#${pigId}</span> tiene fecha probable de parto estimada para el 
                        <strong style="color: #fbbf24; background: rgba(245, 158, 11, 0.25); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 700;">${r.fecha_probable_parto}</strong>.
                    </div>
                </div>
            `;
        });
    }

    // 3. Vacunas pendientes (azules): Fondo oscuro con tinte azul/cian + borde azul claro + texto blanco/claro
    if (vacunacion && vacunacion.length > 0) {
        vacunacion.forEach(v => {
            const pigId = v.id_porcino || v.porcino_id || v.pigId;
            alertBox.innerHTML += `
                <div class="clinical-alert-card clinical-alert-vacuna">
                    <div>
                        <strong style="color: #a5f3fc; display: inline-flex; align-items: center; gap: 5px;">💉 Vacuna Pendiente:</strong> 
                        Porcino <span style="color: #ffffff; font-weight: 700;">#${pigId}</span> tiene pendiente la aplicación de la vacuna 
                        <strong style="color: #38bdf8; background: rgba(6, 182, 212, 0.25); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(6, 182, 212, 0.4); font-weight: 700;">'${v.nombre_vacuna || v.nombre}'</strong>.
                    </div>
                </div>
            `;
        });
    }
}

function obtenerTokenAutenticado() {
    let token = localStorage.getItem('token') || localStorage.getItem('sigepor_token');
    if (!token) {
        try {
            const sesion = JSON.parse(localStorage.getItem('usuarioSesion') || '{}');
            token = sesion.token || (sesion.data && sesion.data.token) || (sesion.user && sesion.user.token);
        } catch (e) {}
    }
    return token;
}

// 📊 HU-08: Exportación de Datos en Formato CSV y JSON
async function exportarDatosModulo(tipo, formato) {
    let data = [];
    try {
        const token = obtenerTokenAutenticado();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_REPORTES}/exportar/${tipo}`, { headers });
        if (res.ok) {
            const result = await res.json();
            data = result.data || [];
        } else {
            throw new Error('Fallback offline');
        }
    } catch (err) {
        console.warn(`Exportando '${tipo}' desde caché local...`);
        if (tipo === 'porcinos') data = JSON.parse(localStorage.getItem('sigeporPigs') || '[]');
        else if (tipo === 'vacunas') data = JSON.parse(localStorage.getItem('sigeporVaccines') || '[]');
        else if (tipo === 'reproduccion') data = JSON.parse(localStorage.getItem('sigeporReproduccion') || '[]');
        else if (tipo === 'alimentos' || tipo === 'inventario') data = JSON.parse(localStorage.getItem('sigeporInventario') || '[]');
        else if (tipo === 'veterinarios') data = JSON.parse(localStorage.getItem('sigeporVeterinarios') || '[]');
    }

    if (!data || data.length === 0) {
        alert(`ℹ️ No hay registros guardados para '${tipo}'. Registre información antes de exportar.`);
        return;
    }

    if (formato === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SIGEPOR_Reporte_${tipo}_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } else if (formato === 'csv') {
        const keys = Object.keys(data[0]);
        let csv = keys.join(',') + '\n';
        data.forEach(row => {
            csv += keys.map(k => `"${(row[k] !== null && row[k] !== undefined ? row[k] : '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SIGEPOR_Reporte_${tipo}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 📜 HU-09: Historial Productivo y Trazabilidad por Animal
async function buscarTrazabilidadPorcino() {
    const id = document.getElementById('searchPigHistory').value.trim();
    if (!id) {
        alert('Ingrese el ID o código del porcino para consultar su trazabilidad.');
        return;
    }

    const timeline = document.getElementById('timelineContainer');
    if (!timeline) return;

    try {
        const token = obtenerTokenAutenticado();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_REPORTES}/trazabilidad/${id}`, { headers });
        if (res.ok) {
            const result = await res.json();
            if (result.data) {
                renderizarTrazabilidadUI(result.data.porcino, result.data.historial);
                return;
            }
        }
    } catch (err) {
        console.warn('Consultando trazabilidad desde caché local...');
    }

    // Fallback Offline Trazabilidad
    const pigs = JSON.parse(localStorage.getItem('sigeporPigs') || '[]');
    const vacunas = JSON.parse(localStorage.getItem('sigeporVaccines') || '[]');
    const repro = JSON.parse(localStorage.getItem('sigeporReproduccion') || '[]');

    const porcino = pigs.find(p => String(p.id) === id || p.identificacion === id);
    if (!porcino) {
        timeline.innerHTML = `<div style="color:#e53e3e; font-weight:bold;">No se encontró ningún porcino con la identificación '${id}' en la memoria local.</div>`;
        return;
    }

    const vacunasPig = vacunas.filter(v => String(v.porcino_id || v.pigId) === id);
    const reproPig = repro.filter(r => String(r.porcino_id) === id);

    renderizarTrazabilidadUI(porcino, { vacunas: vacunasPig, enfermedades: [], reproduccion: reproPig });
}

function renderizarTrazabilidadUI(porcino, historial) {
    const timeline = document.getElementById('timelineContainer');
    if (!timeline) return;

    let html = `
        <div style="background:#f7fafc; border:2px solid #cbd5e0; padding:15px; border-radius:10px; margin-bottom:20px;">
            <h3 style="margin-top:0; color:#2b6cb0;">📋 Ficha Técnica del Porcino #${porcino.id} (${porcino.identificacion || porcino.id})</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px;">
                <div><strong>Raza:</strong> ${porcino.raza || porcino.breed || ''}</div>
                <div><strong>Peso Actual:</strong> ${porcino.peso || porcino.weight || 0} kg</div>
                <div><strong>Estado de Salud:</strong> ${porcino.estado_salud || porcino.health || ''}</div>
                <div><strong>Nacimiento:</strong> ${porcino.fecha_nacimiento || porcino.birth || ''}</div>
                <div><strong>Género:</strong> ${porcino.genero || porcino.gender || ''}</div>
            </div>
        </div>
        <h4>📜 Línea de Tiempo y Trazabilidad Productiva</h4>
    `;

    if (historial.vacunas && historial.vacunas.length > 0) {
        html += `<h5 style="color:#3182ce;">💉 Historial de Vacunación (${historial.vacunas.length})</h5><ul>`;
        historial.vacunas.forEach(v => {
            html += `<li>[${v.fecha_aplicacion || v.fecha || ''}] Vacuna <strong>${v.nombre_vacuna || v.nombre || ''}</strong> (${v.dosis || 2} ml) - Estado: ${v.estado || 'Aplicada'}</li>`;
        });
        html += `</ul>`;
    }

    if (historial.enfermedades && historial.enfermedades.length > 0) {
        html += `<h5 style="color:#e53e3e;">🏥 Diagnósticos Sanitarios (${historial.enfermedades.length})</h5><ul>`;
        historial.enfermedades.forEach(e => {
            html += `<li>[${e.fecha_diagnostico}] Diagnóstico: <strong>${e.tipo_enfermedad}</strong> - Tratamiento: ${e.tratamiento}</li>`;
        });
        html += `</ul>`;
    }

    if (historial.reproduccion && historial.reproduccion.length > 0) {
        html += `<h5 style="color:#805ad5;">🍼 Eventos Reproductivos (${historial.reproduccion.length})</h5><ul>`;
        historial.reproduccion.forEach(r => {
            html += `<li>[${r.fecha_evento}] Evento: <strong>${r.tipo_evento}</strong> (Probable parto: ${r.fecha_probable_parto || '-'}, Lechones: ${r.lechones_nacidos || 0})</li>`;
        });
        html += `</ul>`;
    }

    timeline.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    cargarAlertasSistema();
});
