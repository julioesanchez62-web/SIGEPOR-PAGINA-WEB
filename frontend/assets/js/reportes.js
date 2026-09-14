/**
 * SIGEPOR - Centro de Alertas, Reportes Exportables (CSV/JSON) y Trazabilidad (HU-07 a HU-10)
 */

const API_REPORTES = 'http://localhost:3001/api/reportes';

async function cargarAlertasSistema() {
    try {
        const token = obtenerTokenAutenticado();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_REPORTES}/alertas`, { headers });
        const result = await res.json();

        if (res.ok && result.data) {
            renderizarAlertas(result.data);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderizarAlertas(alertas) {
    const alertBox = document.getElementById('alertsContainer');
    if (!alertBox) return;

    alertBox.innerHTML = '';

    const { salud, reproduccion, vacunacion } = alertas;

    if ((!salud || salud.length === 0) && (!reproduccion || reproduccion.length === 0) && (!vacunacion || vacunacion.length === 0)) {
        alertBox.innerHTML = `<div style="background:#c6f6d5; color:#22543d; padding:15px; border-radius:10px; font-weight:bold;">🎉 ¡Todo en orden! No hay alertas sanitarias ni reproductivas pendientes.</div>`;
        return;
    }

    if (salud && salud.length > 0) {
        salud.forEach(p => {
            alertBox.innerHTML += `
                <div style="background:#fff5f5; border-left:5px solid #e53e3e; padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong>🏥 Atencion Sanitaria:</strong> Porcino #${p.id} (${p.identificacion || p.id}) raza ${p.raza} se encuentra en estado <strong>'${p.estado_salud}'</strong>.
                </div>
            `;
        });
    }

    if (reproduccion && reproduccion.length > 0) {
        reproduccion.forEach(r => {
            alertBox.innerHTML += `
                <div style="background:#feebc8; border-left:5px solid #dd6b20; padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong>🍼 Parto Proximo (114 Dias):</strong> Porcino #${r.porcino_id} (${r.identificacion || r.porcino_id}) tiene fecha probable de parto estimada para el <strong>${r.fecha_probable_parto}</strong>.
                </div>
            `;
        });
    }

    if (vacunacion && vacunacion.length > 0) {
        vacunacion.forEach(v => {
            alertBox.innerHTML += `
                <div style="background:#ebf8ff; border-left:5px solid #3182ce; padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong>💉 Vacuna Pendiente:</strong> Porcino #${v.porcino_id} tiene pendiente la vacuna <strong>'${v.nombre_vacuna}'</strong> asignada para el ${v.fecha_aplicacion}.
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
    try {
        const token = obtenerTokenAutenticado();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_REPORTES}/exportar/${tipo}`, { headers });
        const result = await res.json();

        if (!res.ok) {
            alert('⚠️ ' + (result.message || 'No se pudieron obtener los datos de MySQL. Verifique que el backend esté ejecutándose con `npm start`.'));
            return;
        }

        const data = result.data || [];

        if (data.length === 0) {
            alert(`ℹ️ No hay registros guardados en la base de datos MySQL para '${tipo}'. Registre información en dicha sección antes de exportar.`);
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
    } catch (err) {
        console.error(err);
        alert('❌ Error al conectar con la API de reportes (http://localhost:3001). Asegúrese de iniciar el backend.');
    }
}

// 📜 HU-09: Historial Productivo y Trazabilidad por Animal
async function buscarTrazabilidadPorcino() {
    const id = document.getElementById('searchPigHistory').value.trim();
    if (!id) {
        alert('Ingrese el ID o código del porcino para consultar su trazabilidad.');
        return;
    }

    try {
        const token = obtenerTokenAutenticado();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_REPORTES}/trazabilidad/${id}`, { headers });
        const result = await res.json();

        const timeline = document.getElementById('timelineContainer');
        if (!timeline) return;

        if (!res.ok || !result.data) {
            timeline.innerHTML = `<div style="color:#e53e3e; font-weight:bold;">No se encontró ningún porcino con la identificación '${id}'.</div>`;
            return;
        }

        const { porcino, historial } = result.data;

        let html = `
            <div style="background:#f7fafc; border:2px solid #cbd5e0; padding:15px; border-radius:10px; margin-bottom:20px;">
                <h3 style="margin-top:0; color:#2b6cb0;">📋 Ficha Técnica del Porcino #${porcino.id} (${porcino.identificacion})</h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px;">
                    <div><strong>Raza:</strong> ${porcino.raza}</div>
                    <div><strong>Peso Actual:</strong> ${porcino.peso} kg</div>
                    <div><strong>Estado de Salud:</strong> ${porcino.estado_salud}</div>
                    <div><strong>Nacimiento:</strong> ${porcino.fecha_nacimiento}</div>
                    <div><strong>Género:</strong> ${porcino.genero}</div>
                </div>
            </div>
            <h4>📜 Línea de Tiempo y Trazabilidad Productiva</h4>
        `;

        if (historial.vacunas.length > 0) {
            html += `<h5 style="color:#3182ce;">💉 Historial de Vacunación (${historial.vacunas.length})</h5><ul>`;
            historial.vacunas.forEach(v => {
                html += `<li>[${v.fecha_aplicacion}] Vacuna <strong>${v.nombre_vacuna}</strong> (${v.dosis} ml) - Estado: ${v.estado}</li>`;
            });
            html += `</ul>`;
        }

        if (historial.enfermedades.length > 0) {
            html += `<h5 style="color:#e53e3e;">🏥 Diagnósticos Sanitaros (${historial.enfermedades.length})</h5><ul>`;
            historial.enfermedades.forEach(e => {
                html += `<li>[${e.fecha_diagnostico}] Diagnóstico: <strong>${e.tipo_enfermedad}</strong> - Tratamiento: ${e.tratamiento}</li>`;
            });
            html += `</ul>`;
        }

        if (historial.reproduccion.length > 0) {
            html += `<h5 style="color:#805ad5;">🍼 Eventos Reproductivos (${historial.reproduccion.length})</h5><ul>`;
            historial.reproduccion.forEach(r => {
                html += `<li>[${r.fecha_evento}] Evento: <strong>${r.tipo_evento}</strong> (Probable parto: ${r.fecha_probable_parto || '-'}, Lechones: ${r.lechones_nacidos || 0})</li>`;
            });
            html += `</ul>`;
        }

        timeline.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarAlertasSistema();
});
