/**
 * Test de Integración End-to-End (E2E) - SIGEPOR
 * 
 * Flujo verificado:
 * 1. POST /api/auth/login -> Autenticación y obtención de Token JWT
 * 2. POST /api/porcinos -> Envío de registro con Authorization: Bearer <token>
 * 3. GET /api/porcinos/:id -> Verificación de persistencia en MySQL
 * 4. DELETE /api/porcinos/:id -> Limpieza del registro de prueba
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/mysql');

test.after(async () => {
  try {
    await pool.end();
  } catch (e) {
    // Ignorar si el pool ya fue cerrado
  }
});

test('Flujo E2E Completo: Login JWT -> Registro de Porcino -> Persistencia en MySQL', async () => {
  // PASO 1: Iniciar sesión como Administrador
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      identificador: 'admin@sigepor.com',
      contraseña: 'admin123'
    });

  assert.equal(loginRes.status, 200, 'El login debe responder HTTP 200');
  assert.ok(loginRes.body.token, 'La respuesta debe contener el token JWT');
  
  const token = loginRes.body.token;
  console.log('✓ Paso 1 superado: Token JWT emitido exitosamente.');

  // PASO 2: Enviar un nuevo registro al módulo de porcinos con Bearer Token
  const codigoArete = `TEST-E2E-${Date.now().toString().slice(-4)}`;
  const nuevoPorcino = {
    identificacion: codigoArete,
    raza: 'Landrace',
    peso: 82.5,
    estado_salud: 'Saludable',
    fecha_nacimiento: '2025-05-10',
    genero: 'Macho',
    veterinario_id: 1
  };

  const createRes = await request(app)
    .post('/api/porcinos')
    .set('Authorization', `Bearer ${token}`)
    .send(nuevoPorcino);

  assert.notEqual(createRes.status, 500, 'NUNCA aceptar HTTP 500 en creación');
  assert.equal(createRes.status, 201, 'El porcino debe crearse con código HTTP 201');
  assert.ok(createRes.body.data || createRes.body.porcino, 'Debe retornar el porcino creado');
  
  const porcinoCreado = createRes.body.data || createRes.body.porcino;
  const porcinoId = porcinoCreado.id;
  console.log(`✓ Paso 2 superado: Porcino ${codigoArete} (ID: ${porcinoId}) registrado en Express.`);

  // PASO 3: Validar persistencia real en la base de datos MySQL
  const getRes = await request(app)
    .get(`/api/porcinos/${porcinoId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(getRes.status, 200, 'Debe responder HTTP 200 al consultar');
  const porcinoConsultado = getRes.body.data || getRes.body;
  assert.equal(porcinoConsultado.identificacion, codigoArete, 'El arete consultado debe coincidir');
  console.log(`✓ Paso 3 superado: Persistencia en MySQL confirmada para el registro ${codigoArete}.`);

  // PASO 4: Limpieza del registro de prueba
  const deleteRes = await request(app)
    .delete(`/api/porcinos/${porcinoId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(deleteRes.status, 200, 'El borrado debe retornar HTTP 200');
  console.log(`✓ Paso 4 superado: Registro de prueba ${codigoArete} eliminado limpiamente.`);
});
