const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/mysql');

test.after(async () => {
  try {
    await pool.end();
  } catch (e) {
    // Si el pool ya está cerrado, se ignora
  }
});

test('CP-HU06-01: Enviar POST a /api/auth/login con credenciales válidas debe retornar 200 y JWT', async () => {
  // Ajustado exactamente a las claves mapeadas por tu controlador con tilde y letra ñ
  const credencialesPrueba = {
    email: 'julioesanchez62@gmail.com',
    contraseña: '123456' // Escrito exactamente con 'ñ' y tilde 'á' como pide tu req.body
  };

  const response = await request(app)
    .post('/api/auth/login')
    .send(credencialesPrueba);

  // Imprimir siempre la respuesta para ver el flujo
  console.log('--- EXAMEN DE RESPUESTA ---');
  console.log('Código HTTP:', response.status);
  console.log('Cuerpo devuelto:', response.body);
  console.log('---------------------------');

  assert.equal(response.status, 200, 'El código de respuesta debe ser 200 OK');
  assert.ok(response.body.token || response.body.data?.token || response.body.token_sesion, 'Debe generar un token JWT');
});
