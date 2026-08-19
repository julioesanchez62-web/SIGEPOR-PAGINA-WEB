// Función para validar el Login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const documento = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;
    const errorBox = document.getElementById('errorBox');

    if (documento === "" || password === "") {
        errorBox.style.display = "flex";
    } else {
        errorBox.style.display = "none";
        alert("¡Bienvenido al sistema SIGEPOR!");
        window.location.href = "registroporcino.html";
    }
});

// Función para cerrar el mensaje de error
document.querySelector('.close-btn')?.addEventListener('click', function() {
    document.getElementById('errorBox').style.display = "none";
});

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
    if (submitButton) {
        submitButton.innerHTML = '🐷 AÑADIR PORCINO';
    }
    if (formTitle) {
        formTitle.textContent = 'Registrar Nuevo Porcino';
    }
    if (formIcon) {
        formIcon.textContent = '➕';
    }
}

function renderTable() {
    if (!pigTableBody) return;

    pigTableBody.innerHTML = '';

    if (!state.pigs.length) {
        if (pigTableEmpty) {
            pigTableEmpty.style.display = 'block';
        }
        return;
    }

    if (pigTableEmpty) {
        pigTableEmpty.style.display = 'none';
    }

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
            if (submitButton) {
                submitButton.innerHTML = '💾 GUARDAR CAMBIOS';
            }
            if (formTitle) {
                formTitle.textContent = 'Editar Porcino';
            }
            if (formIcon) {
                formIcon.textContent = '✏️';
            }
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

        if (!id || !breed || !weight || !health || !birth || !gender) {
            return;
        }

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

function getStoredPigs() {
    try {
        return JSON.parse(localStorage.getItem('sigeporPigs') || '[]');
    } catch (error) {
        return [];
    }
}

function getStoredVaccines() {
    try {
        return JSON.parse(localStorage.getItem('sigeporVaccines') || '[]');
    } catch (error) {
        return [];
    }
}

function getPreferences() {
    try {
        return {
            theme: 'claro',
            notifications: true,
            title: 'SIGEPOR',
            ...JSON.parse(localStorage.getItem('sigeporPreferences') || '{}')
        };
    } catch (error) {
        return { theme: 'claro', notifications: true, title: 'SIGEPOR' };
    }
}

function applyPreferences(pref) {
    document.body.classList.toggle('theme-dark', pref.theme === 'oscuro');
    document.body.dataset.theme = pref.theme || 'claro';
    const appTitle = document.querySelector('.sidebar h3');
    if (appTitle) {
        appTitle.textContent = pref.title || 'SIGEPOR';
    }
    const titleTag = document.querySelector('title');
    if (titleTag) {
        titleTag.textContent = `${pref.title || 'SIGEPOR'} - Gestión Porcina`;
    }
}

function createPanel() {
    if (document.getElementById('sigeporPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'sigeporPanel';
    panel.className = 'sigepor-panel';
    panel.innerHTML = `
        <div class="sigepor-panel-backdrop"></div>
        <div class="sigepor-panel-card">
            <div class="sigepor-panel-header">
                <h3>Centro de Gestión</h3>
                <button type="button" class="sigepor-close">✕</button>
            </div>
            <div class="sigepor-panel-tabs">
                <button type="button" class="sigepor-tab active" data-tab="reports">📊 Reportes</button>
                <button type="button" class="sigepor-tab" data-tab="settings">⚙️ Configuración</button>
            </div>
            <div id="panelReports" class="sigepor-tab-panel active">
                <div class="report-grid">
                    <div class="report-card">
                        <h4>Porcinos registrados</h4>
                        <p id="reportPigs">0</p>
                    </div>
                    <div class="report-card">
                        <h4>Vacunas registradas</h4>
                        <p id="reportVaccines">0</p>
                    </div>
                    <div class="report-card">
                        <h4>Estado general</h4>
                        <p id="reportHealth">Sin datos</p>
                    </div>
                </div>
                <div class="report-summary">
                    <h4>Resumen del sistema</h4>
                    <p id="reportMessage">Aún no hay información suficiente para mostrar reportes detallados.</p>
                </div>
            </div>
            <div id="panelSettings" class="sigepor-tab-panel">
                <form id="settingsForm" class="settings-form">
                    <label>Nombre del sistema
                        <input type="text" id="settingTitle" placeholder="SIGEPOR">
                    </label>
                    <label>Tema
                        <select id="settingTheme">
                            <option value="claro">Claro</option>
                            <option value="oscuro">Oscuro</option>
                        </select>
                    </label>
                    <label class="checkbox-row">
                        <input type="checkbox" id="settingNotifications">
                        <span>Notificaciones activadas</span>
                    </label>
                    <button type="submit" class="btn-save">Guardar configuración</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('.sigepor-close').addEventListener('click', () => panel.classList.remove('show'));
    panel.querySelector('.sigepor-panel-backdrop').addEventListener('click', () => panel.classList.remove('show'));
    panel.querySelectorAll('.sigepor-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            panel.querySelectorAll('.sigepor-tab').forEach((tab) => tab.classList.remove('active'));
            panel.querySelectorAll('.sigepor-tab-panel').forEach((tabPanel) => tabPanel.classList.remove('active'));
            btn.classList.add('active');
            const target = panel.querySelector(`#panel${btn.dataset.tab === 'reports' ? 'Reports' : 'Settings'}`);
            if (target) target.classList.add('active');
        });
    });

    const form = panel.querySelector('#settingsForm');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const preferences = {
            title: panel.querySelector('#settingTitle').value || 'SIGEPOR',
            theme: panel.querySelector('#settingTheme').value || 'claro',
            notifications: panel.querySelector('#settingNotifications').checked
        };
        localStorage.setItem('sigeporPreferences', JSON.stringify(preferences));
        applyPreferences(preferences);
        const message = panel.querySelector('#reportMessage');
        if (message) {
            message.textContent = 'Configuración guardada correctamente.';
        }
    });
}

function openPanel(tab = 'reports') {
    createPanel();
    const panel = document.getElementById('sigeporPanel');
    if (!panel) return;
    panel.classList.add('show');
    panel.querySelectorAll('.sigepor-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    panel.querySelectorAll('.sigepor-tab-panel').forEach((tabPanel) => {
        tabPanel.classList.toggle('active', (tab === 'reports' && tabPanel.id === 'panelReports') || (tab === 'settings' && tabPanel.id === 'panelSettings'));
    });
}

function updateReports() {
    const panel = document.getElementById('sigeporPanel');
    if (!panel) return;

    const pigs = getStoredPigs();
    const vaccines = getStoredVaccines();
    const healthy = pigs.filter((pig) => pig.health === 'Saludable').length;
    const reportPigs = panel.querySelector('#reportPigs');
    const reportVaccines = panel.querySelector('#reportVaccines');
    const reportHealth = panel.querySelector('#reportHealth');
    const reportMessage = panel.querySelector('#reportMessage');

    if (reportPigs) reportPigs.textContent = pigs.length;
    if (reportVaccines) reportVaccines.textContent = vaccines.length;
    if (reportHealth) reportHealth.textContent = healthy > 0 ? `${healthy} saludables` : 'Sin datos';
    if (reportMessage) {
        reportMessage.textContent = pigs.length || vaccines.length
            ? `Hay ${pigs.length} porcinos y ${vaccines.length} vacunaciones registradas para seguimiento.`
            : 'Aún no hay información suficiente para mostrar reportes detallados.';
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('veterinarioActivo');
    window.location.href = 'index.html';
}

function initSidebarPanels() {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach((link) => {
        const text = link.textContent.trim().toLowerCase();
        if (text.includes('reportes')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPanel('reports');
                updateReports();
            });
        }
        if (text.includes('configuración') || text.includes('configuracion')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPanel('settings');
            });
        }
    });

    const prefs = getPreferences();
    applyPreferences(prefs);
    const panel = document.getElementById('sigeporPanel');
    if (panel) {
        const titleInput = panel.querySelector('#settingTitle');
        const themeInput = panel.querySelector('#settingTheme');
        const notificationsInput = panel.querySelector('#settingNotifications');
        if (titleInput) titleInput.value = prefs.title || 'SIGEPOR';
        if (themeInput) themeInput.value = prefs.theme || 'claro';
        if (notificationsInput) notificationsInput.checked = prefs.notifications !== false;
        updateReports();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initPigManager();
    initSidebarPanels();
    const prefs = getPreferences();
    applyPreferences(prefs);
});

