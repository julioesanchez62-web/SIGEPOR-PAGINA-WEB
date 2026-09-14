/**
 * JavaScript para Gestión de Porcinos (Conectado a MySQL Workbench mediante Node.js Backend)
 */

const API_BASE_PORCINOS = 'http://localhost:3001/api/porcinos';

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
        const resultado = await respuesta.json();

        if (resultado.status === 'success' && Array.isArray(resultado.data)) {
            selectVeterinario.innerHTML = '<option value="">Seleccione veterinario</option>';
            resultado.data.forEach(vet => {
                const option = document.createElement('option');
                option.value = vet.id;
                const inactivo = Number(vet.activo) === 0;
                option.textContent = `👨‍⚕️ ${vet.nombre}${inactivo ? ' (Inactivo)' : ''}`;
                if (inactivo) option.disabled = true;
                selectVeterinario.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar lista de veterinarios:', error);
    }
}

// 2. Cargar porcinos desde MySQL y renderizar tabla y estadísticas
async function cargarPorcinos() {
    try {
        const respuesta = await fetch(API_BASE_PORCINOS);
        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === 'success') {
            const porcinos = resultado.data || [];
            renderizarTablaPorcinos(porcinos);
            actualizarEstadisticas(resultado.stats || {
                total: porcinos.length,
                saludables: porcinos.filter(p => p.estado_salud === 'Saludable').length,
                observacion: porcinos.filter(p => p.estado_salud === 'En Observación').length,
                enfermos: porcinos.filter(p => p.estado_salud === 'Enfermo').length
            });
        } else {
            console.error('Error al obtener lista de porcinos:', resultado.message);
        }
    } catch (error) {
        console.error('Error de conexión al cargar porcinos:', error);
    }
}

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
        if (p.estado_salud === 'En Observación') {
            healthBadge = `<span style="padding: 3px 8px; border-radius: 10px; font-weight:600; font-size:0.85rem; background: #fff3cd; color: #856404;">⚠ En Observación</span>`;
        } else if (p.estado_salud === 'Enfermo') {
            healthBadge = `<span style="padding: 3px 8px; border-radius: 10px; font-weight:600; font-size:0.85rem; background: #f8d7da; color: #721c24;">🏥 Enfermo</span>`;
        }

        tr.innerHTML = `
            <td><strong>#${p.id} (${p.identificacion || p.id})</strong></td>
            <td>🐷 ${p.raza}</td>
            <td>${p.peso} kg</td>
            <td>${healthBadge}</td>
            <td>${p.fecha_nacimiento}</td>
            <td>${p.genero || '-'}</td>
            <td>${p.veterinario_nombre ? `👨‍⚕️ ${p.veterinario_nombre}` : '<em style="color:#888;">Sin asignar</em>'}</td>
            <td>
                <div class="table-actions" style="display:flex; gap:4px; justify-content:center;">
                    <button type="button" class="btn-table-action btn-table-edit" style="padding:4px 8px; border:none; border-radius:5px; background:#e2e8f0; cursor:pointer;" onclick="cargarParaEditar('${p.identificacion || p.id}')">✏️ Cargar</button>
                    <button type="button" class="btn-table-action btn-table-delete" style="padding:4px 8px; border:none; border-radius:5px; background:#fed7d7; color:#9b2c2c; cursor:pointer;" onclick="eliminarPorcinoDirecto('${p.identificacion || p.id}')">🗑️ Borrar</button>
                </div>
            </td>
        `;
        pigTableBody.appendChild(tr);
    });
}

function actualizarEstadisticas(stats) {
    if (statTotal) statTotal.textContent = stats.total || 0;
    if (statHealthy) statHealthy.textContent = stats.saludables || 0;
    if (statObserving) statObserving.textContent = stats.observacion || 0;
    if (statSick) statSick.textContent = stats.enfermos || 0;
}

// 3. Guardar porcino nuevo (POST)
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
            const respuesta = await fetch(API_BASE_PORCINOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const resultado = await respuesta.json();

            if (respuesta.ok && resultado.status === 'success') {
                alert('🎉 ' + resultado.message);
                limpiarFormularioPorcino();
                cargarPorcinos();
            } else {
                alert('⚠️ Error al registrar: ' + (resultado.message || 'No se pudo guardar el porcino.'));
            }
        } catch (error) {
            console.error(error);
            alert('❌ No hay comunicación con el servidor backend de SIGEPOR.');
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
        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === 'success') {
            const p = resultado.data;
            inputPigId.value = p.identificacion || p.id;
            selectPigBreed.value = p.raza || '';
            inputPigWeight.value = p.peso || '';
            selectPigHealth.value = p.estado_salud || '';
            inputPigBirth.value = p.fecha_nacimiento || '';
            selectPigGender.value = p.genero || '';
            selectVeterinario.value = p.veterinario_id || '';

            document.getElementById('formTitle').textContent = `Consultando Porcino (${p.identificacion || p.id})`;
            document.getElementById('formIcon').textContent = '🔍';
            alert(`✅ Datos del porcino '${p.identificacion || p.id}' cargados con éxito.`);
        } else {
            alert('⚠️ ' + (resultado.message || 'Porcino no encontrado.'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error al consultar con la base de datos.');
    }
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
        const respuesta = await fetch(`${API_BASE_PORCINOS}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === 'success') {
            alert('✅ ' + resultado.message);
            limpiarFormularioPorcino();
            cargarPorcinos();
        } else {
            alert('⚠️ Error al actualizar: ' + (resultado.message || 'No se pudo actualizar.'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error al comunicarse con el backend.');
    }
}

// 6. Borrar porcino (DELETE)
async function borrarPorcino() {
    let id = inputPigId.value.trim();
    if (!id) {
        id = prompt('Ingrese el ID o Identificación del porcino que desea eliminar:');
        if (!id) return;
    }

    const confirmar = confirm(`¿Está seguro de eliminar definitivamente al porcino '${id}' de MySQL?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_BASE_PORCINOS}/${id}`, {
            method: 'DELETE'
        });
        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === 'success') {
            alert('🗑️ ' + resultado.message);
            limpiarFormularioPorcino();
            cargarPorcinos();
        } else {
            alert('⚠️ Error al borrar: ' + (resultado.message || 'No se pudo eliminar.'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error al intentar eliminar.');
    }
}

// Cargar en formulario para editar
async function cargarParaEditar(id) {
    try {
        const respuesta = await fetch(`${API_BASE_PORCINOS}/${id}`);
        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === 'success') {
            const p = resultado.data;
            inputPigId.value = p.identificacion || p.id;
            selectPigBreed.value = p.raza || '';
            inputPigWeight.value = p.peso || '';
            selectPigHealth.value = p.estado_salud || '';
            inputPigBirth.value = p.fecha_nacimiento || '';
            selectPigGender.value = p.genero || '';
            selectVeterinario.value = p.veterinario_id || '';

            document.getElementById('formTitle').textContent = `Editar Porcino (${p.identificacion || p.id})`;
            document.getElementById('formIcon').textContent = '✏️';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error(error);
    }
}

// Eliminar directamente desde botón de la tabla
async function eliminarPorcinoDirecto(id) {
    const confirmar = confirm(`¿Desea eliminar al porcino '${id}' de la base de datos?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_BASE_PORCINOS}/${id}`, {
            method: 'DELETE'
        });
        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === 'success') {
            alert('🗑️ ' + resultado.message);
            cargarPorcinos();
        } else {
            alert('⚠️ ' + (resultado.message || 'No se pudo eliminar.'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error al eliminar porcino.');
    }
}

// Limpiar formulario
function limpiarFormularioPorcino() {
    if (pigForm) pigForm.reset();
    inputPigId.value = '';
    document.getElementById('formTitle').textContent = 'Registrar Nuevo Porcino';
    document.getElementById('formIcon').textContent = '➕';
}

// Cerrar Sesión
function cerrarSesion() {
    if (confirm('¿Desea cerrar la sesión actual?')) {
        localStorage.removeItem('usuarioSesion');
        localStorage.removeItem('veterinarioActivo');
        window.location.href = 'index.html';
    }
}

function openPanel(tipo) {
    alert(`Panel de ${tipo === 'reports' ? 'Reportes' : 'Configuración'} disponible en el menú principal.`);
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    cargarVeterinariosEnSelect();
    cargarPorcinos();
});

