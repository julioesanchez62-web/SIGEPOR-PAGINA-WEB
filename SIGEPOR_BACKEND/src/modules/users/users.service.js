const usersRepository = require('./users.repository');
const bcrypt = require('bcryptjs');

class UsersService {
  async listarUsuarios() {
    return await usersRepository.obtenerTodos();
  }

  async obtenerUsuarioPorId(id) {
    const usuario = await usersRepository.obtenerPorId(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  async registrarUsuario(datosUsuario) {
    const existeCorreo = await usersRepository.obtenerPorCorreo(datosUsuario.correo);
    if (existeCorreo) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datosUsuario.contraseña, salt);

    const nuevoUsuario = {
      ...datosUsuario,
      contraseña: passwordHash
    };

    const idInsertado = await usersRepository.crear(nuevoUsuario);
    return { id_usuario: idInsertado, ...datosUsuario, contraseña: undefined };
  }

  async actualizarUsuario(id, datosUsuario) {
    await this.obtenerUsuarioPorId(id);
    return await usersRepository.actualizar(id, datosUsuario);
  }

  async eliminarUsuario(id) {
    await this.obtenerUsuarioPorId(id);
    return await usersRepository.eliminar(id);
  }
}

module.exports = new UsersService();