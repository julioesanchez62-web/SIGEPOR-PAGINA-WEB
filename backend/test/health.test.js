const { test, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/config/mysql');
const { JWT_SECRET } = require('../src/middlewares/auth.middleware');

// Variables dinámicas compartidas para asegurar la cascada relacional
const identificacionUnica = `RFID-${Math.floor(Math.random() * 9000) + 1000}`;
let idPorcinoCreado = null;

// TOKENS DE SESIÓN FICTICIOS PARA PRUEBAS (RBAC)
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

after(async () => {
  try {
    if (idPorcinoCreado) {
      await pool.query("DELETE FROM porcinos WHERE id_porcino = ?", [idPorcinoCreado]);
    } else {
      await pool.query("DELETE FROM porcinos WHERE identificacion = ?", [identificacionUnica]);
    }
    await pool.end();
  } catch (e) {
    // Si el pool ya cerró, ignorar
  }
});

// 1. PRUEBAS DE GESTIÓN Y HEALTHCHECK (CP-RNF01-01)
describe('Infraestructura - Healthcheck', () => {
  test('GET /health returns ok status', async () => {
    const response = await request(app).get('/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
  });

  test('GET /health debe retornar 200 OK y estado activo', async () => {
    const response = await request(app).get('/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok'); 
  });
});

// 2. PRUEBAS DE GESTIÓN PORCINA (CP-HU01-01)
describe('Gestión Porcina', { concurrency: false }, () => {
  test('POST /api/porcinos - Registrar nuevo porcino exitosamente', async () => {
    // Ajustado milimétricamente al esquema estricto de tu base de datos MySQL
    const nuevoPorcino = {
      identificacion: identificacionUnica,       // SÍ, OBLIGATORIO 🔴
      veterinario_id: 1,                          // SÍ, OBLIGATORIO 🔴 (Forzamos valor semilla 1)
      veterinarioId: 1,
      raza: 'Landrace',
      peso: 115.5,
      estado_salud: 'saludable',
      estadoSalud: 'saludable',
      fecha_nacimiento: '2026-01-10',
      fechaNacimiento: '2026-01-10',
      genero: 'Macho',
      id_corral: 1,
      idCorral: 1
    };

    const response = await request(app)
      .post('/api/porcinos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(nuevoPorcino);

    if (response.status === 400 || response.status === 500) {
      assert.fail(`El backend rechazó los datos: ${JSON.stringify(response.body)}`);
    }

    assert.equal(response.status, 201);
    
    // Captura flexible del ID generado físicamente
    const data = response.body.porcino || response.body.data || response.body;
    idPorcinoCreado = data.id_porcino || data.idPorcino || data.id;
  });

  test('POST /api/porcinos - Rechazar porcino con código RFID duplicado', async () => {
    const porcinoDuplicado = {
      identificacion: identificacionUnica,
      veterinario_id: 1,
      raza: 'Landrace',
      peso: 120.0,
      estado_salud: 'saludable',
      fecha_nacimiento: '2026-01-10',
      genero: 'Macho',
      id_corral: 1
    };

    const response = await request(app)
      .post('/api/porcinos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(porcinoDuplicado);

    assert.equal(response.status, 409);
  });
});

// 3. PRUEBAS DE REPRODUCCIÓN (CP-HU02-01)
describe('Reproducción', () => {
  test('POST /api/reproduccion - Registrar parto probable o destete exitosamente', async () => {
    const porcinoTarget = idPorcinoCreado || 1;
    
    const eventoReproductivo = {
      porcino_id: porcinoTarget,        // SÍ, OBLIGATORIO 🔴
      porcinoId: porcinoTarget,
      tipo_evento: 'Parto Probable',     // SÍ, OBLIGATORIO 🔴
      tipoEvento: 'Parto Probable',
      fecha_evento: '2026-11-20',       // SÍ, OBLIGATORIO 🔴
      fechaEvento: '2026-11-20',
      fecha: '2026-11-20',
      observaciones: 'Ninguna'
    };

    const response = await request(app)
      .post('/api/reproduccion')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(eventoReproductivo);

    assert.equal(response.status, 201);
  });
});

// 4. PRUEBAS DE SANIDAD (CP-HU04-01)
describe('Sanidad', () => {
  test('POST /api/sanidad/vacunas - Registrar nueva aplicación de vacuna por Veterinario', async () => {
    const porcinoTarget = idPorcinoCreado || 1;

    const nuevaVacuna = {
      porcino_id: porcinoTarget,        // SÍ, OBLIGATORIO 🔴
      porcinoId: porcinoTarget,
      nombre_vacuna: 'Parvovirus Porcino', // SÍ, OBLIGATORIO 🔴
      nombreVacuna: 'Parvovirus Porcino',
      fecha_aplicacion: '2026-11-05',   // SÍ, OBLIGATORIO 🔴
      fechaAplicacion: '2026-11-05',
      estado: 'Aplicada',               // SÍ, OBLIGATORIO 🔴
      dosis: 2.00,                      // SÍ, OBLIGATORIO 🔴 (Enviamos tipo float numérico para decimal(5,2))
      id_veterinario: 1,
      idVeterinario: 1
    };

    const response = await request(app)
      .post('/api/sanidad/vacunas')
      .set('Authorization', `Bearer ${tokenVeterinario}`)
      .send(nuevaVacuna);

    assert.equal(response.status, 201);
  });
});

// 5. PRUEBAS DE INVENTARIO (CP-HU05-01)

describe('Inventario - Stock', () => {
  test('POST /api/alimentacion - Registrar suministro de alimento exitosamente', async () => {
    const nuevoSuministro = {
      tipo_alimento: 'Concentrado Iniciación Cerdos',
      cantidad: 250.50,
      fecha_suministro: '2026-11-06',
      proveedor: 'Purina S.A.',
      corral: 'Corral Sector A1',
      id_porcino: 1,
      id_usuario: 1
    };

    // Ajustado a la ruta directa del módulo de alimentación
    const response = await request(app)
      .post('/api/alimentacion')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(nuevoSuministro);

    if (response.status === 400 || response.status === 500) {
      assert.fail(`El backend rechazó el registro de stock (Error ${response.status}): ${JSON.stringify(response.body)}`);
    }

    assert.equal(response.status, 201, 'El servidor debe retornar código HTTP 201 Created');
  });
});