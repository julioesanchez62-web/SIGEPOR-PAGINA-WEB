const { query } = require('../config/database');

async function getAllPorcinos() {
  return query('SELECT * FROM porcinos ORDER BY id DESC');
}

async function createPorcino({ identificacion, raza, peso, estadoSalud }) {
  return query(
    'INSERT INTO porcinos (identificacion, raza, peso, estado_salud) VALUES (?, ?, ?, ?)',
    [identificacion, raza, peso, estadoSalud]
  );
}

module.exports = {
  getAllPorcinos,
  createPorcino
};
