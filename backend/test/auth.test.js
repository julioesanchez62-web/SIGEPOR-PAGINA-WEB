const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { JWT_SECRET } = require('../src/middlewares/auth.middleware');

test('GET /api/porcinos sin token debe retornar 401 Unauthenticated', async () => {
  const response = await request(app).get('/api/porcinos');
  assert.equal(response.status, 401);
  assert.equal(response.body.status, 'fail');
  assert.ok(response.body.message.includes('Acceso denegado'));
});

test('GET /api/porcinos con token inválido debe retornar 401', async () => {
  const response = await request(app)
    .get('/api/porcinos')
    .set('Authorization', 'Bearer token_invalido_123');
  assert.equal(response.status, 401);
  assert.equal(response.body.status, 'fail');
  assert.ok(response.body.message.includes('Token de sesión inválido'));
});

test('GET /api/users con token de rol Empleado (idRol: 2) debe retornar 403 Forbidden por RBAC', async () => {
  const tokenEmpleado = jwt.sign(
    { id: 999, nombre: 'Empleado Test', email: 'emp@test.com', idRol: 2 },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${tokenEmpleado}`);
  assert.equal(response.status, 403);
  assert.equal(response.body.status, 'fail');
  assert.ok(response.body.message.includes('Acceso restringido'));
});

test('GET /api/porcinos con token de Administrador (idRol: 1) pasa autenticación', async () => {
  const tokenAdmin = jwt.sign(
    { id: 1, nombre: 'Admin Test', email: 'admin@test.com', idRol: 1 },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const response = await request(app)
    .get('/api/porcinos')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  // Pasa auth: retorna 200 (si hay BD) o 500 (error de query si no hay BD), pero NO 401 ni 403
  assert.ok([200, 500].includes(response.status));
});
