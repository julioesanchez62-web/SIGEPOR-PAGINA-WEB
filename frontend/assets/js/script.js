// ==========================================
// 🔐 SECCIÓN: INICIO DE SESIÓN CON ROLES RBAC (HU-06)
// ==========================================

function seleccionarRolIngreso(rolId, rolNombre, icono) {
    const hiddenRol = document.getElementById('loginRolEsperado');
    if (hiddenRol) hiddenRol.value = rolId;

    const titleEl = document.getElementById('loginTitle');
    const subTitleEl = document.getElementById('loginSubtitle');

    if (titleEl) titleEl.textContent = `${icono} INGRESO DE ${rolNombre.toUpperCase()}`;
    if (subTitleEl) {
        if (Number(rolId) === 1) {
            subTitleEl.textContent = 'Acceso al portal de control y administración global SIGEPOR';
        } else if (Number(rolId) === 3) {
            subTitleEl.textContent = 'Acceso al portal médico veterinario y control de sanidad';
        } else {
            subTitleEl.textContent = 'Acceso a gestión de granja porcina e inventarios';
        }
    }

    const tabs = document.querySelectorAll('.role-tab');
    tabs.forEach(tab => {
        if (Number(tab.getAttribute('data-role')) === Number(rolId)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}
window.seleccionarRolIngreso = seleccionarRolIngreso;

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 1. Captura segura de los inputs
    const inputUser = document.getElementById('loginIdentificador') ||
                      document.getElementById('loginUser') || 
                      document.getElementById('username') || 
                      document.querySelector('input[type="text"]') ||
                      document.querySelector('input[type="email"]');
                      
    const inputPass = document.getElementById('loginPassword') || 
                      document.getElementById('password') || 
                      document.querySelector('input[type="password"]');
                      
    const errorBox = document.getElementById('errorBox');
    const rolEsperado = Number(document.getElementById('loginRolEsperado')?.value || 1);

    const valorCorreo = inputUser ? inputUser.value.trim() : "";
    const valorPassword = inputPass ? inputPass.value : "";

    const datosLogin = {
        correo: valorCorreo,      
        contraseña: valorPassword  
    };

    if (!valorCorreo || !valorPassword) {
        if (errorBox) {
            errorBox.style.display = "flex";
            const errorText = errorBox.querySelector('p') || errorBox;
            errorText.textContent = "POR FAVOR, RELLENA AMBOS CAMPOS";
        }
        return;
    }

    try {
        // Petición HTTP al backend
        const respuesta = await fetch('http://localhost:3001/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosLogin)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            if (errorBox) errorBox.style.display = "none";
            
            const tokenGuardar = resultado.token || (resultado.data && resultado.data.token) || (resultado.user && resultado.user.token);
            if (tokenGuardar) {
                localStorage.setItem('token', tokenGuardar);
                localStorage.setItem('sigepor_token', tokenGuardar);
            }

            const usuarioSesion = resultado.user || resultado.data || resultado;
            localStorage.setItem('usuarioSesion', JSON.stringify(usuarioSesion));
            localStorage.setItem('usuario_sigepor', JSON.stringify(usuarioSesion));

            const idRol = Number(usuarioSesion.idRol || usuarioSesion.rol || 2);
            const rolNombre = usuarioSesion.rolNombre || (idRol === 1 ? 'Administrador' : idRol === 3 ? 'Veterinario' : idRol === 4 ? 'Cliente' : 'Empleado');

            alert(`¡Bienvenido al sistema SIGEPOR!\nUsuario: ${usuarioSesion.nombre || usuarioSesion.email}\nRol: ${rolNombre}`);

            // Redirección inteligente por rol (RBAC HU-06)
            if (idRol === 3) {
                window.location.href = "vacunas.html";
            } else if (idRol === 4) {
                window.location.href = "reportes.html";
            } else {
                window.location.href = "registroporcino.html";
            }
        } else {
            if (errorBox) {
                errorBox.style.display = "flex";
                const errorText = errorBox.querySelector('p') || errorBox;
                errorText.textContent = resultado.message || "DATOS INCORRECTOS. INGRESARLOS NUEVAMENTE";
            }
        }

    } catch (error) {
        console.error('❌ Error de conexión con la API:', error);
        alert('No se pudo conectar con el servidor de SIGEPOR. Asegúrate de tener el backend ejecutándose en el puerto 3001.');
    }
});

// Función auxiliar para ocultar la caja de errores
document.querySelector('.close-btn')?.addEventListener('click', function() {
    document.getElementById('errorBox').style.display = "none";
});


// ==========================================
// 🐷 SECCIÓN: GESTIÓN DE PORCINOS (LOCALSTORAGE)
// ==========================================
const pigForm = document.getElementById('pigForm');
const pigTableBody = document.querySelector('#pigTable tbody');
const pigTableEmpty = document.getElementById('tableEmpty');
const statTotal = document.getElementById('statTotal');
const statHealthy = document.getElementById('statHealthy');
const statObserving = document.getElementById('statObserving');
const statSick = document.getElementById('statSick');
const formTitle = document.getElementById('formTitle');
const formIcon = document.getElementById('formIcon');
const submitButton = document.getElementById('btnSubmitForm');
const storageKey = 'sigeporPigs';

const state = {
    pigs: [],
    editingId: null
};

function loadPigs() {
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('No se pudieron cargar los porcinos guardados:', error);
        return [];
    }
}

function savePigs() {
    localStorage.setItem(storageKey, JSON.stringify(state.pigs));
}

function updateStats() {
    const total = state.pigs.length;
    const healthy = state.pigs.filter((pig) => pig.health === 'Saludable').length;
    const observing = state.pigs.filter((pig) => pig.health === 'En Observación').length;
    const sick = state.pigs.filter((pig) => pig.health === 'Enfermo').length;

    if (statTotal) statTotal.textContent = total;
    if (statHealthy) statHealthy.textContent = healthy;
    if (statObserving) statObserving.textContent = observing;
    if (statSick) statSick.textContent = sick;
}

function resetFormMode() {
    state.editingId = null;
    if (submitButton) submitButton.innerHTML = '🐷 AÑADIR PORCINO';
    if (formTitle) formTitle.textContent = 'Registrar Nuevo Porcino';
    if (formIcon) formIcon.textContent = '➕';
}

function renderTable() {
    if (!pigTableBody) return;
    pigTableBody.innerHTML = '';

    if (!state.pigs.length) {
        if (pigTableEmpty) pigTableEmpty.style.display = 'block';
        return;
    }

    if (pigTableEmpty) pigTableEmpty.style.display = 'none';

    state.pigs.forEach((pig) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pig.id}</td>
            <td>${pig.breed}</td>
            <td>${pig.weight} kg</td>
            <td>${pig.health}</td>
            <td>${pig.birth}</td>
            <td>
                <div class="action-buttons">
                    <button type="button" class="btn-edit">Editar</button>
                    <button type="button" class="btn-delete">Eliminar</button>
                </div>
            </td>
        `;

        row.querySelector('.btn-edit').addEventListener('click', () => {
            const selectedPig = state.pigs.find((item) => item.id === pig.id);
            if (!selectedPig) return;

            document.getElementById('pigId').value = selectedPig.id;
            document.getElementById('pigBreed').value = selectedPig.breed;
            document.getElementById('pigWeight').value = selectedPig.weight;
            document.getElementById('pigHealth').value = selectedPig.health;
            document.getElementById('pigBirth').value = selectedPig.birth;
            document.getElementById('pigGender').value = selectedPig.gender;

            state.editingId = selectedPig.id;
            if (submitButton) submitButton.innerHTML = '💾 GUARDAR CAMBIOS';
            if (formTitle) formTitle.textContent = 'Editar Porcino';
            if (formIcon) formIcon.textContent = '✏️';
        });

        row.querySelector('.btn-delete').addEventListener('click', () => {
            state.pigs = state.pigs.filter((item) => item.id !== pig.id);
            savePigs();
            updateStats();
            renderTable();
        });

        pigTableBody.appendChild(row);
    });
}

function initPigManager() {
    state.pigs = loadPigs();
    updateStats();
    renderTable();

    pigForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('pigId').value.trim();
        const breed = document.getElementById('pigBreed').value;
        const weight = document.getElementById('pigWeight').value;
        const health = document.getElementById('pigHealth').value;
        const birth = document.getElementById('pigBirth').value;
        const gender = document.getElementById('pigGender').value;

        if (!id || !breed || !weight || !health || !birth || !gender) return;

        if (state.editingId) {
            const index = state.pigs.findIndex((pig) => pig.id === state.editingId);
            if (index !== -1) {
                state.pigs[index] = { id, breed, weight, health, birth, gender };
            }
        } else {
            state.pigs.push({ id, breed, weight, health, birth, gender });
        }

        savePigs();
        updateStats();
        renderTable();
        pigForm.reset();
        resetFormMode();
    });
}

// Inicialización de la sección porcina (se ejecuta solo si existe el formulario en pantalla)
if (pigForm) {
    initPigManager();
}
