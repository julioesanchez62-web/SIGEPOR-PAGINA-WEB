/**
 * JavaScript para Gestión de Porcinos (Sincronización Bidireccional HU-03 & MySQL)
 */

const API_BASE_PORCINOS = 'http://localhost:3001/api/porcinos';
const LOCAL_KEY_PORCINOS = 'sigeporPigs';

const pigForm = document.getElementById('pigForm');
const inputPigId = document.getElementById('pigId');
const selectPigBreed = document.getElementById('pigBreed');
const inputPigWeight = document.getElementById('pigWeight');
const selectPigHealth = document.getElementById('pigHealth');
const inputPigBirth = document.getElementById('pigBirth');
const selectPigGender = document.getElementById('pigGender');
const selectVeterinario = document.getElementById('veterinario_id');

const pigTableBody = document.querySelector('#pigTable tbody');
const tableEmpty = document.getElementById('tableEmpty');

const statTotal = document.getElementById('statTotal');
const statHealthy = document.getElementById('statHealthy');
const statObserving = document.getElementById('statObserving');
const statSick = document.getElementById('statSick');

// 1. Cargar veterinarios en el <select>
async function cargarVeterinariosEnSelect() {
    if (!selectVeterinario) return;

    try {
        const respuesta = await fetch(`${API_BASE_PORCINOS}/veterinarios`);
        if (respuesta.ok) {
            const resultado = await respuesta.json();
            if (resultado.status === 'success' && Array.isArray(resultado.data)) {
                localStorage.setItem('sigepor_cache_veterinarios', JSON.stringify(resultado.data));
                poblarSelectVeterinarios(resultado.data);
                return;
            }
        }
    } catch (error) {
        console.warn('Cargando veterinarios desde memoria local:', error.message);
    }

    const cached = JSON.parse(localStorage.getItem('sigepor_cache_veterinarios') || '[]');
    poblarSelectVeterinarios(cached);
}

function poblarSelectVeterinarios(lista) {
    if (!selectVeterinario) return;
    selectVeterinario.innerHTML = '<option value="">Seleccione veterinario</option>';
    lista.forEach(vet => {
        const option = document.createElement('option');
        option.value = vet.id;
        const inactivo = Number(vet.activo) === 0;
        option.textContent = `👨‍⚕️ ${vet.nombre}${inactivo ? ' (Inactivo)' : ''}`;
        if (inactivo) option.disabled = true;
        selectVeterinario.appendChild(option);
    });
}

// 2. Cargar porcinos (Sincronización MySQL <-> localStorage)
async function cargarPorcinos() {
    let porcinos = [];
    try {
        const respuesta = await fetch(API_BASE_PORCINOS);
        if (respuesta.ok) {
            const resultado = await respuesta.json();
            if (resultado.status === 'success') {
                porcinos = resultado.data || [];
                localStorage.setItem(LOCAL_KEY_PORCINOS, JSON.stringify(porcinos));
            }
        } else {
            throw new Error('Servidor no disponible');
        }
    } catch (error) {
        console.warn('Cargando lista porcina desde localStorage (Modo Offline)');
        try {
            const cached = localStorage.getItem(LOCAL_KEY_PORCINOS);
            porcinos = cached ? JSON.parse(cached) : [];
        } catch (e) {
            porcinos = [];
        }
    }

    renderizarTablaPorcinos(porcinos);
    actualizarEstadisticasCalculadas(porcinos);
}
window.cargarPorcinos = cargarPorcinos;

function renderizarTablaPorcinos(porcinos) {
    if (!pigTableBody) return;
    pigTableBody.innerHTML = '';

    if (!porcinos || porcinos.length === 0) {
        if (tableEmpty) tableEmpty.style.display = 'block';
        return;
    }

    if (tableEmpty) tableEmpty.style.display = 'none';

    porcinos.forEach(p => {
        const tr = document.createElement('tr');
        
        let healthBadge = `<span style="padding: 3px 8px; border-radius: 10px; font-weight:600; font-size:0.85rem; background: #d4edda; color: #155724;">✓ Saludable</span>`;
        if (p.estado_salud === 'En Observación' || p.health === 'En Observación') {
            healthBadge = `<span style="padding: 3px 8px; border-radius: 10px; font-weight:600; font-size:0.85rem; background: #fff3cd; color: #856404;">⚠ En Observación</span>`;
        } else if (p.estado_salud === 'Enfermo' || p.health === 'Enfermo') {
            healthBadge = `<span style="padding: 3px 8px; border-radius: 10px; font-weight:600; font-size:0.85rem; background: #f8d7da; color: #721c24;">🏥 Enfermo</span>`;
        }

        const pigIdCode = p.identificacion || p.id;

        tr.innerHTML = `
            <td><strong>#${p.id || pigIdCode} (${pigIdCode})</strong></td>
            <td>🐷 ${p.raza || p.breed || ''}</td>
            <td>${p.peso || p.weight || 0} kg</td>
            <td>${healthBadge}</td>
            <td>${p.fecha_nacimiento || p.birth || '-'}</td>
            <td>${p.genero || p.gender || '-'}</td>
            <td>${p.veterinario_nombre ? `👨‍⚕️ ${p.veterinario_nombre}` : '<em style="color:#888;">Sin asignar</em>'}</td>
            <td>
                <div class="table-actions" style="display:flex; gap:4px; justify-content:center;">
                    <button type="button" class="btn-table-action" style="padding:4px 8px; border:none; border-radius:5px; background:#ebf8ff; color:#2b6cb0; cursor:pointer;" onclick="mostrarCodigoQR('${pigIdCode}', '${p.raza || p.breed}', '${p.peso || p.weight}', '${p.estado_salud || p.health}')">📱 QR</button>
                    <button type="button" class="btn-table-action btn-table-edit" style="padding:4px 8px; border:none; border-radius:5px; background:#e2e8f0; cursor:pointer;" onclick="cargarParaEditar('${pigIdCode}')">✏️ Cargar</button>
                    <button type="button" class="btn-table-action btn-table-delete" style="padding:4px 8px; border:none; border-radius:5px; background:#fed7d7; color:#9b2c2c; cursor:pointer;" onclick="eliminarPorcinoDirecto('${pigIdCode}')">🗑️ Borrar</button>
                </div>
            </td>
        `;
        pigTableBody.appendChild(tr);
    });
}

function actualizarEstadisticasCalculadas(porcinos) {
    const list = Array.isArray(porcinos) ? porcinos : [];
    const total = list.length;
    const saludables = list.filter(p => (p.estado_salud || p.health) === 'Saludable').length;
    const observacion = list.filter(p => (p.estado_salud || p.health) === 'En Observación').length;
    const enfermos = list.filter(p => (p.estado_salud || p.health) === 'Enfermo').length;

    if (statTotal) statTotal.textContent = total;
    if (statHealthy) statHealthy.textContent = saludables;
    if (statObserving) statObserving.textContent = observacion;
    if (statSick) statSick.textContent = enfermos;
}

// 3. Guardar porcino nuevo (POST) con respaldo offline
if (pigForm) {
    pigForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            identificacion: inputPigId.value.trim(),
            raza: selectPigBreed.value,
            peso: parseFloat(inputPigWeight.value),
            estado_salud: selectPigHealth.value,
            fecha_nacimiento: inputPigBirth.value,
            genero: selectPigGender.value,
            veterinario_id: selectVeterinario.value ? parseInt(selectVeterinario.value, 10) : null
        };

        if (!datos.identificacion || !datos.raza || isNaN(datos.peso) || !datos.estado_salud || !datos.fecha_nacimiento || !datos.genero) {
            alert('⚠️ Por favor completa todos los campos obligatorios del formulario.');
            return;
        }

        try {
            const respuesta = typeof fetchConFallbackOffline === 'function'
                ? await fetchConFallbackOffline(API_BASE_PORCINOS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                })
                : await fetch(API_BASE_PORCINOS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

            const resultado = await respuesta.json();

            // Guardado optimista en localStorage
            const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_PORCINOS) || '[]');
            const index = cached.findIndex(p => (p.identificacion || String(p.id)) === datos.identificacion);
            if (index >= 0) {
                cached[index] = { ...cached[index], ...datos };
            } else {
                cached.push({ id: datos.identificacion, ...datos });
            }
            localStorage.setItem(LOCAL_KEY_PORCINOS, JSON.stringify(cached));

            if (respuesta.ok || respuesta.offline) {
                alert('🎉 ' + (resultado.message || 'Porcino guardado con éxito.'));
                limpiarFormularioPorcino();
                cargarPorcinos();
            } else {
                alert('⚠️ Error al registrar: ' + (resultado.message || 'No se pudo guardar el porcino.'));
            }
        } catch (error) {
            console.error(error);
            alert('❌ No hay comunicación con el servidor backend. Se mantendrá el registro en memoria.');
        }
    });
}

// 4. Consultar porcino por ID/Identificación (GET)
async function consultarPorcino() {
    let id = inputPigId.value.trim();
    if (!id) {
        id = prompt('Ingrese el ID o Código de Identificación del porcino a consultar:');
        if (!id) return;
        inputPigId.value = id;
    }

    try {
        const respuesta = await fetch(`${API_BASE_PORCINOS}/${id}`);
        if (respuesta.ok) {
            const resultado = await respuesta.json();
            if (resultado.status === 'success') {
                cargardatosEnFormulario(resultado.data);
                alert(`✅ Datos del porcino '${id}' cargados con éxito desde MySQL.`);
                return;
            }
        }
    } catch (error) {
        console.warn('Buscando en cache local:', error);
    }

    const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_PORCINOS) || '[]');
    const encontrado = cached.find(p => (p.identificacion || String(p.id)) === id);
    if (encontrado) {
        cargardatosEnFormulario(encontrado);
        alert(`✅ Datos del porcino '${id}' cargados desde caché local.`);
    } else {
        alert('⚠️ Porcino no encontrado.');
    }
}

function cargardatosEnFormulario(p) {
    inputPigId.value = p.identificacion || p.id;
    selectPigBreed.value = p.raza || p.breed || '';
    inputPigWeight.value = p.peso || p.weight || '';
    selectPigHealth.value = p.estado_salud || p.health || '';
    inputPigBirth.value = p.fecha_nacimiento || p.birth || '';
    selectPigGender.value = p.genero || p.gender || '';
    selectVeterinario.value = p.veterinario_id || '';

    document.getElementById('formTitle').textContent = `Editar Porcino (${p.identificacion || p.id})`;
    document.getElementById('formIcon').textContent = '✏️';
}

// 5. Actualizar datos de porcino (PUT)
async function actualizarPorcino() {
    const id = inputPigId.value.trim();
    if (!id) {
        alert('⚠️ Debe ingresar o consultar el ID/Identificación del porcino que desea actualizar.');
        return;
    }

    const datos = {
        identificacion: inputPigId.value.trim(),
        raza: selectPigBreed.value,
        peso: parseFloat(inputPigWeight.value),
        estado_salud: selectPigHealth.value,
        fecha_nacimiento: inputPigBirth.value,
        genero: selectPigGender.value,
        veterinario_id: selectVeterinario.value ? parseInt(selectVeterinario.value, 10) : null
    };

    try {
        const respuesta = typeof fetchConFallbackOffline === 'function'
            ? await fetchConFallbackOffline(`${API_BASE_PORCINOS}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            : await fetch(`${API_BASE_PORCINOS}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

        const resultado = await respuesta.json();

        // Actualización optimista local
        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_PORCINOS) || '[]');
        const idx = cached.findIndex(p => (p.identificacion || String(p.id)) === id);
        if (idx >= 0) {
            cached[idx] = { ...cached[idx], ...datos };
            localStorage.setItem(LOCAL_KEY_PORCINOS, JSON.stringify(cached));
        }

        if (respuesta.ok || respuesta.offline) {
            alert('✅ ' + (resultado.message || 'Porcino actualizado.'));
            limpiarFormularioPorcino();
            cargarPorcinos();
        } else {
            alert('⚠️ Error al actualizar: ' + (resultado.message || 'No se pudo actualizar.'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error de comunicación con el backend.');
    }
}

// 6. Borrar porcino (DELETE)
async function borrarPorcino() {
    let id = inputPigId.value.trim();
    if (!id) {
        id = prompt('Ingrese el ID o Identificación del porcino que desea eliminar:');
        if (!id) return;
    }

    const confirmar = confirm(`¿Está seguro de eliminar definitivamente al porcino '${id}'?`);
    if (!confirmar) return;

    try {
        const respuesta = typeof fetchConFallbackOffline === 'function'
            ? await fetchConFallbackOffline(`${API_BASE_PORCINOS}/${id}`, { method: 'DELETE' })
            : await fetch(`${API_BASE_PORCINOS}/${id}`, { method: 'DELETE' });

        const resultado = await respuesta.json();

        // Borrado optimista local
        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY_PORCINOS) || '[]');
        const filtrados = cached.filter(p => (p.identificacion || String(p.id)) !== id);
        localStorage.setItem(LOCAL_KEY_PORCINOS, JSON.stringify(filtrados));

        if (respuesta.ok || respuesta.offline) {
            alert('🗑️ ' + (resultado.message || 'Porcino eliminado.'));
            limpiarFormularioPorcino();
            cargarPorcinos();
        } else {
            alert('⚠️ Error al borrar: ' + (resultado.message || 'No se pudo eliminar.'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error al intentar eliminar porcino.');
    }
}

async function cargarParaEditar(id) {
    inputPigId.value = id;
    await consultarPorcino();
}

async function eliminarPorcinoDirecto(id) {
    inputPigId.value = id;
    await borrarPorcino();
}

// Limpiar formulario
function limpiarFormularioPorcino() {
    if (pigForm) pigForm.reset();
    inputPigId.value = '';
    document.getElementById('formTitle').textContent = 'Registrar Nuevo Porcino';
    document.getElementById('formIcon').textContent = '➕';
}

function cerrarSesion() {
    if (confirm('¿Desea cerrar la sesión actual?')) {
        localStorage.removeItem('usuarioSesion');
        localStorage.removeItem('veterinarioActivo');
        window.location.href = 'index.html';
    }
}

function openPanel(tipo) {
    if (tipo === 'reports') {
        window.location.href = 'reportes.html';
    } else {
        alert('Configuración disponible en el menú principal.');
    }
}

function mostrarCodigoQR(id, raza, peso, estado) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`SIGEPOR-PORCINO:${id}|Raza:${raza}|Peso:${peso}kg|Estado:${estado}`)}`;
    
    let modal = document.getElementById('qr-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'qr-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999;';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:15px; text-align:center; max-width:350px; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
            <button onclick="document.getElementById('qr-modal').style.display='none'" style="position:absolute; top:10px; right:15px; border:none; background:none; font-size:1.4rem; cursor:pointer;">×</button>
            <h3 style="margin-top:0; color:#2b6cb0;">📱 Etiqueta QR / RFID</h3>
            <p style="margin:5px 0 15px; color:#4a5568; font-weight:bold;">Porcino #${id}</p>
            <img src="${qrUrl}" alt="Código QR Porcino" style="border:4px solid #e2e8f0; border-radius:10px; padding:5px; background:white;">
            <div style="margin-top:15px; font-size:0.85rem; color:#718096; text-align:left; background:#f7fafc; padding:10px; border-radius:8px;">
                <div><strong>Raza:</strong> ${raza}</div>
                <div><strong>Peso:</strong> ${peso} kg</div>
                <div><strong>Estado:</strong> ${estado}</div>
            </div>
            <button onclick="window.print()" style="margin-top:15px; padding:8px 16px; background:#3182ce; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">🖨️ Imprimir Etiqueta</button>
        </div>
    `;
    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVeterinariosEnSelect();
    cargarPorcinos();
});
