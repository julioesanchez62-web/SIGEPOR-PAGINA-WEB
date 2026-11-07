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

test('CP-HU06-02: Registro público con intento de escalada de privilegios (idRol: 1) debe ser mitigado', async () => {
  // Generar un correo único por ejecución para evitar errores 409 por duplicados
  const correoDinamico = `intruso_${Date.now()}@sigepor.com`;

  const payloadIntruso = {
    nombre: 'Usuario Intruso',
    nombre_usuario: `intruso_${Date.now()}`,
    email: correoDinamico,
    correo: correoDinamico,
    contraseña: 'password123',
    idRol: 1 // El atacante intenta forzar el rol de Administrador
  };

  // Realizar la petición HTTP y definir la variable 'response'
  const response = await request(app)
    .post('/api/users')
    .send(payloadIntruso);

  console.log('--- EXAMEN DE SEGURIDAD RBAC Y MITIGACIÓN ---');
  console.log('Código HTTP obtenido:', response.status);
  console.log('Mensaje del servidor:', response.body);
  console.log('---------------------------------------------');

  // 1. Validamos que el registro sea permitido públicamente (201 Created)
  assert.equal(response.status, 201, 'El registro público debe retornar 201 Created');

  // 2. Validamos que el backend neutralizara el ataque asignando el rol de Cliente (4)
  assert.equal(response.body.user.idRol, 4, '¡ÉXITO DE SEGURIDAD! El sistema mitigó la escalada de privilegios correctamente asignando el rol 4.');
});
