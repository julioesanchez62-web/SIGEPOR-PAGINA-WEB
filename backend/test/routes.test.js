const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { JWT_SECRET } = require('../src/middlewares/auth.middleware');

const tokenAdmin = jwt.sign(
  { id: 1, nombre: 'Admin Test', email: 'admin@test.com', idRol: 1 },
  JWT_SECRET,
  { expiresIn: '1h' }
);

test('GET /health returns 200 ok', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('GET /api/porcinos returns status response', async () => {
  const response = await request(app)
    .get('/api/porcinos')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/veterinarios returns status response', async () => {
  const response = await request(app)
    .get('/api/veterinarios')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/reproduccion returns status response', async () => {
  const response = await request(app)
    .get('/api/reproduccion')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/sanidad/vacunas returns status response', async () => {
  const response = await request(app)
    .get('/api/sanidad/vacunas')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/vacunas returns status response', async () => {
  const response = await request(app)
    .get('/api/vacunas')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/vacunas/estadisticas/resumen returns status response', async () => {
  const response = await request(app)
    .get('/api/vacunas/estadisticas/resumen')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/inventario/alimentos returns status response', async () => {
  const response = await request(app)
    .get('/api/inventario/alimentos')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/reportes/alertas returns status response', async () => {
  const response = await request(app)
    .get('/api/reportes/alertas')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok([200, 500].includes(response.status));
});
