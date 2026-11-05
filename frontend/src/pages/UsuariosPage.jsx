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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

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
      setEditingId(u.id_usuario || u.id);
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

      const rolNombre = ROLE_NAMES[formData.idRol] || 'Usuario';

      if (editingId) {
        await usersService.update(editingId, payload);
        setAlert({ 
          type: 'success', 
          message: `✅ Usuario '${formData.nombre}' actualizado correctamente con rol ${rolNombre}.` 
        });
      } else {
        await usersService.create(payload);
        setAlert({ 
          type: 'success', 
          message: `🎉 ¡Usuario '${formData.nombre}' creado exitosamente en el sistema con rol ${rolNombre}!` 
        });
      }
      setIsModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await loadUsers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al procesar la operación' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id, nombre) => {
    const currentUid = currentUser?.id_usuario || currentUser?.id;
    if (id === currentUid) {
      alert('No puedes eliminar tu propio usuario mientras mantienes la sesión activa.');
      return;
    }
    if (!window.confirm(`¿Confirma eliminar definitivamente a '${nombre}' del sistema?`)) return;

    try {
      await usersService.delete(id);
      setAlert({ type: 'success', message: `🗑️ Usuario '${nombre}' eliminado exitosamente.` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await loadUsers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar usuario' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtrado de usuarios por pestaña/rol
  const filteredUsers = users.filter((u) => {
    if (selectedRoleFilter === 'ALL') return true;
    return Number(u.idRol) === Number(selectedRoleFilter);
  });

  const countByRole = (roleId) => users.filter((u) => Number(u.idRol) === Number(roleId)).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Gestión de Usuarios y Roles RBAC</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Panel administrativo para crear, consultar, modificar roles (Veterinario, Administrador, etc.) y eliminar usuarios.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          ➕ Crear Nuevo Usuario
        </button>
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Tarjetas resumen por Rol */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div 
          onClick={() => setSelectedRoleFilter('ALL')}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: selectedRoleFilter === 'ALL' ? '2px solid var(--primary, #15803d)' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Todos los Usuarios</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{users.length}</div>
        </div>

        <div 
          onClick={() => setSelectedRoleFilter(ROLES.ADMIN)}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: Number(selectedRoleFilter) === ROLES.ADMIN ? '2px solid #8b5cf6' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👑 Administradores</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>{countByRole(ROLES.ADMIN)}</div>
        </div>

        <div 
          onClick={() => setSelectedRoleFilter(ROLES.VETERINARIO)}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: Number(selectedRoleFilter) === ROLES.VETERINARIO ? '2px solid #0284c7' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👨‍⚕️ Veterinarios</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0284c7' }}>{countByRole(ROLES.VETERINARIO)}</div>
        </div>

        <div 
          onClick={() => setSelectedRoleFilter(ROLES.EMPLEADO)}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: Number(selectedRoleFilter) === ROLES.EMPLEADO ? '2px solid #15803d' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👷 Empleados</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>{countByRole(ROLES.EMPLEADO)}</div>
        </div>

        <div 
          onClick={() => setSelectedRoleFilter(ROLES.CLIENTE)}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: Number(selectedRoleFilter) === ROLES.CLIENTE ? '2px solid #f59e0b' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🛒 Clientes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{countByRole(ROLES.CLIENTE)}</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            {selectedRoleFilter === 'ALL' ? 'Todos los Usuarios Registrados' : `Usuarios con Rol: ${ROLE_NAMES[selectedRoleFilter] || selectedRoleFilter}`}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={loadUsers}>
            🔄 Recargar
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando usuarios desde MySQL...
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No se encontraron usuarios registrados en esta categoría.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const uId = u.id_usuario || u.id;
                    const currentUid = currentUser?.id_usuario || currentUser?.id;
                    return (
                      <tr key={uId}>
                        <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                        <td>{u.email || u.correo}</td>
                        <td>
                          <span className={`role-tag ${Number(u.idRol) === 1 ? 'admin' : Number(u.idRol) === 3 ? 'vet' : Number(u.idRol) === 4 ? 'cli' : 'emp'}`}>
                            {ROLE_NAMES[u.idRol] || u.rol_nombre || 'Empleado'}
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
                            ✏️ Modificar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(uId, u.nombre)}
                            disabled={uId === currentUid}
                            title={uId === currentUid ? 'No puedes eliminar tu propia cuenta activa' : 'Eliminar usuario'}
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Modificar Usuario y Rol' : 'Crear Nuevo Usuario en SIGEPOR'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Ej: Dr. Alejandro Ramos"
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
              placeholder="ejemplo@sigepor.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Contraseña {editingId && '(Dejar en blanco para conservar)'}</label>
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
                <option value={ROLES.ADMIN}>👑 Administrador (Acceso Total)</option>
                <option value={ROLES.VETERINARIO}>👨‍⚕️ Veterinario (Sanidad, Porcinos, Reproducción)</option>
                <option value={ROLES.EMPLEADO}>👷 Empleado (Operaciones e Inventario)</option>
                <option value={ROLES.CLIENTE}>🛒 Cliente (Vista Restringida)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? '💾 Guardar Cambios' : '➕ Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
