const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/config/mysql');
const { JWT_SECRET } = require('../src/middlewares/auth.middleware');

// Generar un identificador único dinámico por cada ejecución
const rfidUnico = `RFID-${Math.floor(Math.random() * 9000) + 1000}`;

// ----------------------------------------------------
// TOKENS DE SESIÓN FICTICIOS PARA PRUEBAS (RBAC)
// ----------------------------------------------------
const tokenAdmin = jwt.sign(
  { id: 1, nombre: 'Admin Test', email: 'admin@test.com', idRol: 1 },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const tokenVeterinario = jwt.sign(
  { id: 888, nombre: 'Dr. Perez', email: 'perez@test.com', idRol: 3 },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Hook para cerrar el pool de conexiones al finalizar
test.after(async () => {
  try {
    // Limpiar el registro dinámico generado en esta tanda
    await pool.query("DELETE FROM porcinos WHERE codigo_rfid = ?", [rfidUnico]);
    await pool.end();
  } catch (e) {
    // Ignorar si el pool ya cerró
  }
});

// ----------------------------------------------------
// 1. PRUEBAS DE GESTIÓN Y HEALTHCHECK (CP-RNF01-01)
// ----------------------------------------------------
test('GET /health returns ok status', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.message, 'SIGEPOR backend is running');
});

test('GET /health debe retornar 200 OK y estado activo', async () => {
  const response = await request(app).get('/health');
  
  assert.equal(response.status, 200);
  // Corregido: Ajustado a 'ok' según la respuesta nativa de tu API
  assert.equal(response.body.status, 'ok'); 
});

// ----------------------------------------------------
// 2. PRUEBAS DE GESTIÓN PORCINA (CP-HU01-01)
// ----------------------------------------------------
test('POST /api/porcinos - Registrar nuevo porcino exitosamente', async () => {
  const nuevoPorcino = {
    codigo_rfid: rfidUnico, // Código dinámico único
    peso: 115.5,
    fecha_nacimiento: '2026-01-10',
    estado: 'saludable'
  };

  const response = await request(app)
    .post('/api/porcinos')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send(nuevoPorcino);

  // Si devuelve 400, verificamos el mensaje para no interrumpir el flujo del test
  if (response.status === 400) {
    assert.fail(`El backend rechazó los datos (400 Bad Request): ${JSON.stringify(response.body)}`);
  }

  assert.equal(response.status, 201);
});

test('POST /api/porcinos - Rechazar porcino con código RFID duplicado', async () => {
  const porcinoDuplicado = {
    codigo_rfid: rfidUnico, // Usar el mismo código creado en el test anterior
    peso: 120.0,
    fecha_nacimiento: '2026-01-10',
    estado: 'saludable'
  };

  const response = await request(app)
    .post('/api/porcinos')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send(porcinoDuplicado);

  assert.equal(response.status, 400);
});

// ----------------------------------------------------
// 3. PRUEBAS DE REPRODUCCIÓN (CP-HU02-01)
// ----------------------------------------------------
test('POST /api/reproduccion - Registrar parto probable o destete exitosamente', async () => {
  const eventoReproductivo = {
    id_porcino: 1, 
    tipo_evento: 'Parto Probable',
    fecha_evento: '2026-11-20',
    observaciones: 'Ninguna'
  };

  const response = await request(app)
    .post('/api/reproduccion')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send(eventoReproductivo);

  if (response.status === 400) {
    assert.fail(`Error en Reproducción (400): Asegúrate de que exista un porcino con id: 1 o revisa las columnas enviadas.`);
  }

  assert.equal(response.status, 201);
});

// ----------------------------------------------------
// 4. PRUEBAS DE SANIDAD (CP-HU04-01)
// ----------------------------------------------------
test('POST /api/sanidad/vacunas - Registrar nueva aplicación de vacuna por Veterinario', async () => {
  const nuevaVacuna = {
    id_porcino: 1,
    nombre_vacuna: 'Parvovirus Porcino',
    fecha_aplicacion: '2026-11-05',
    dosis: '2 ml',
    estado: 'Aplicada'
  };

  const response = await request(app)
    .post('/api/sanidad/vacunas')
    .set('Authorization', `Bearer ${tokenVeterinario}`)
    .send(nuevaVacuna);

  if (response.status === 400) {
    assert.fail(`Error en Vacunas (400): Valida las propiedades del payload según los requerimientos de tu controlador.`);
  }

  assert.equal(response.status, 201);
});
