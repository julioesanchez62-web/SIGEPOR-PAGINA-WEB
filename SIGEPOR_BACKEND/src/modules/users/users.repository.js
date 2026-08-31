const { query } = require('../../config/mysql');

class UsersRepository {
  async obtenerTodos() {
    return await query(
      'SELECT id, nombre, email, usuario, contraseña, fecha_registro, activo FROM usuarios'
    );
  }

  async obtenerPorId(id) {
    const rows = await query(
      'SELECT id, nombre, email, usuario, contraseña, fecha_registro, activo FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async obtenerPorCorreo(correo) {
    const rows = await query(
      'SELECT * FROM usuarios WHERE email = ?',
      [correo]
    );
    return rows[0];
  }

  async crear(datosUsuario) {
    // Extraemos los datos del validador de Node
    const { nombre_completo, correo, contraseña } = datosUsuario;
    
    // Mapeamos los datos a tus columnas reales: nombre, email, usuario, contraseña
    const result = await query(
      'INSERT INTO usuarios (nombre, email, usuario, contraseña) VALUES (?, ?, ?, ?)',
      [
        nombre_completo, 
        correo, 
        correo, // Usamos provisionalmente el correo como nombre de "usuario" para que no quede vacío
        contraseña
      ]
    );
    return result.insertId;
  }

  async actualizar(id, datosUsuario) {
    const { nombre_completo, correo } = datosUsuario;
    const result = await query(
      'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
      [nombre_completo, correo, id]
    );
    return result.affectedRows > 0;
  }

  async eliminar(id) {
    const result = await query('DELETE FROM usuarios WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new UsersRepository();