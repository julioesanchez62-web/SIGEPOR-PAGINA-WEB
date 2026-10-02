import React, { useState, useEffect } from 'react';
import { usersService } from '../api/users.service';
import { useAuth, ROLE_NAMES, ROLES } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

export const UsuariosPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    correo: '',
    contraseña: '',
    idRol: 2
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error cargando lista de usuarios' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (u = null) => {
    if (u) {
      setEditingId(u.id);
      setFormData({
        nombre: u.nombre || '',
        email: u.email || u.correo || '',
        correo: u.email || u.correo || '',
        contraseña: '',
        idRol: Number(u.idRol || 2)
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        email: '',
        correo: '',
        contraseña: '',
        idRol: 2
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        correo: formData.email,
        email: formData.email,
        contraseña: formData.contraseña,
        idRol: Number(formData.idRol)
      };

      if (editingId) {
        await usersService.update(editingId, payload);
        setAlert({ type: 'success', message: 'Usuario actualizado correctamente' });
      } else {
        await usersService.create(payload);
        setAlert({ type: 'success', message: 'Usuario creado con éxito en MySQL' });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al procesar la operación' });
    }
  };

  const handleDelete = async (id, nombre) => {
    if (id === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario mientras mantienes la sesión activa.');
      return;
    }
    if (!window.confirm(`¿Confirma eliminar definitivamente a ${nombre}?`)) return;

    try {
      await usersService.delete(id);
      setAlert({ type: 'success', message: 'Usuario eliminado exitosamente' });
      loadUsers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar usuario' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Administración de Usuarios y Roles</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Control centralizado de credenciales, roles y privilegios de acceso al sistema (RBAC)
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          👥 Crear Nuevo Usuario
        </button>
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Usuarios del Sistema SIGEPOR</h3>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando usuarios...
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Rol Asignado</th>
                  <th>Fecha Registro</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                      <td>{u.email || u.correo}</td>
                      <td>
                        <span className={`role-tag ${Number(u.idRol) === 1 ? 'admin' : Number(u.idRol) === 3 ? 'vet' : Number(u.idRol) === 4 ? 'cli' : 'emp'}`}>
                          {ROLE_NAMES[u.idRol] || 'Empleado'}
                        </span>
                      </td>
                      <td>{u.fecha_registro ? String(u.fecha_registro).slice(0, 10) : '-'}</td>
                      <td>
                        <span className={`status-pill ${Number(u.activo) !== 0 ? 'activo' : 'inactivo'}`}>
                          {Number(u.activo) !== 0 ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ marginRight: '0.5rem' }}
                          onClick={() => handleOpenModal(u)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u.id, u.nombre)}
                          disabled={u.id === currentUser?.id}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Contraseña {editingId && '(Opcional para actualizar)'}</label>
              <input
                type="password"
                className="form-control"
                required={!editingId}
                placeholder="••••••••"
                value={formData.contraseña}
                onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rol de Acceso (RBAC)</label>
              <select
                className="form-control"
                value={formData.idRol}
                onChange={(e) => setFormData({ ...formData, idRol: Number(e.target.value) })}
              >
                <option value={ROLES.ADMIN}>👑 Administrador</option>
                <option value={ROLES.VETERINARIO}>👨‍⚕️ Veterinario</option>
                <option value={ROLES.EMPLEADO}>👷 Empleado</option>
                <option value={ROLES.CLIENTE}>🛒 Cliente</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
