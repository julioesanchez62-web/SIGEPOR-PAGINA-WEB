// Asegúrate de que el formulario en tu HTML tenga el id="form-porcino"
const formulario = document.getElementById('form-porcino');

// Función para cargar veterinarios desde la Base de Datos de manera dinámica
async function cargarVeterinarios() {
    const selectVeterinario = document.getElementById('veterinario_id');
    if (!selectVeterinario) return;

    try {
        const respuesta = await fetch('http://localhost:3001/api/porcinos/veterinarios');
        const resultado = await respuesta.json();

        if (resultado.status === 'success') {
            // Mantenemos solo la primera opción por defecto ("Seleccione veterinario")
            selectVeterinario.innerHTML = '<option value="">Seleccione veterinario</option>';

            // Recorremos los datos que vinieron de la base de datos y creamos las etiquetas <option>
            resultado.data.forEach(vet => {
                const option = document.createElement('option');
                option.value = vet.id; // El ID numérico que se guardará en la tabla porcinos
                option.textContent = vet.nombre; // El nombre que verá el usuario en pantalla
                selectVeterinario.appendChild(option);
            });
            console.log("✅ Lista de veterinarios actualizada desde la BD.");
        }
    } catch (error) {
        console.error('Error al cargar veterinarios:', error);
    }
}

// Ejecutar la función inmediatamente al cargar la página html
document.addEventListener('DOMContentLoaded', cargarVeterinarios);

formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // Detiene la recarga automática de la página

    // Captura los valores usando los IDs de tus inputs en el HTML
    const datosPorcino = {
        veterinario_id: document.getElementById('veterinario_id').value,
        identificacion: document.getElementById('identificacion').value,
        raza: document.getElementById('raza').value,
        peso: parseFloat(document.getElementById('peso').value),
        estado_salud: document.getElementById('estado_salud').value,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
        genero: document.getElementById('genero').value
    };

    try {
        // Enviar la petición HTTP POST al puerto de tu backend (Ej: 3000)
        const respuesta = await fetch('http://localhost:3001/api/porcinos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosPorcino)
        });

        const resultado = await respuesta.json();

        if (respuesta.status === 201) {
            alert('🎉 ' + resultado.message);
            formulario.reset(); // Limpia los campos del formulario tras el éxito
        } else {
            alert('⚠️ Error: ' + (resultado.message || 'No se pudo completar el registro.'));
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        alert('❌ No hay comunicación con el servidor backend de SIGEPOR.');
    }
});
