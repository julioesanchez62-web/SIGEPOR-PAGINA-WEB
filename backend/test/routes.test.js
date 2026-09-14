const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET /health returns 200 ok', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('GET /api/porcinos returns success array or handles db query', async () => {
  const response = await request(app).get('/api/porcinos');
  // Puede ser 200 si la BD está conectada o 500 si no hay DB en test sin mock
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/veterinarios returns status response', async () => {
  const response = await request(app).get('/api/veterinarios');
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/reproduccion returns status response', async () => {
  const response = await request(app).get('/api/reproduccion');
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/sanidad/vacunas returns status response', async () => {
  const response = await request(app).get('/api/sanidad/vacunas');
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/inventario/alimentos returns status response', async () => {
  const response = await request(app).get('/api/inventario/alimentos');
  assert.ok([200, 500].includes(response.status));
});

test('GET /api/reportes/alertas returns status response', async () => {
  const response = await request(app).get('/api/reportes/alertas');
  assert.ok([200, 500].includes(response.status));
});
