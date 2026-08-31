const usersService = require('./users.service');

class UsersController {
  async obtenerTodos(req, res) {
    try {
      const usuarios = await usersService.listarUsuarios();
      res.json({ ok: true, data: usuarios });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usersService.obtenerUsuarioPorId(id);
      res.json({ ok: true, data: usuario });
    } catch (error) {
      res.status(404).json({ ok: false, mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      const nuevoUsuario = await usersService.registrarUsuario(req.body);
      res.status(201).json({ ok: true, mensaje: 'Usuario creado exitosamente', data: nuevoUsuario });
    } catch (error) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      await usersService.actualizarUsuario(id, req.body);
      res.json({ ok: true, mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      await usersService.eliminarUsuario(id);
      res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(404).json({ ok: false, mensaje: error.message });
    }
  }
}

module.exports = new UsersController();