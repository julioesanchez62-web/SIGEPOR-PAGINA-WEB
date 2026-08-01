const { query } = require('../config/database');

async function findByUserOrEmail(usuario, email) {
  return query('SELECT Id_Veterinario FROM veterinarios WHERE Nombre_Completo = ? OR Direccion = ?', [usuario, email]);
}

async function createUser({ nombre, email, usuario, contraseñaHash }) {
  const nombreCorto = nombre.slice(0, 44);
  const emailCorto = email.slice(0, 44);
  const usuarioCorto = usuario.slice(0, 44);
  const especialidad = 'General';

  return query(
    'INSERT INTO veterinarios (Nombre_Completo, Direccion, Telefono, Especialidad) VALUES (?, ?, ?, ?)',
    [nombreCorto, emailCorto, usuarioCorto, especialidad]
  );
}

async function getAllUsers() {
  return query('SELECT Id_Veterinario as id, Nombre_Completo as nombre, Direccion as email, Telefono as usuario, Especialidad as especialidad FROM veterinarios ORDER BY Id_Veterinario DESC');
}

module.exports = {
  findByUserOrEmail,
  createUser,
  getAllUsers
};
