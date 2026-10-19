import React, { useState, useEffect } from 'react';
import { veterinariosService } from '../api/veterinarios.service';
import { useAuth, ROLES } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

export const VeterinariosPage = () => {
  const { hasRole } = useAuth();
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    usuario: '',
    contraseña: '',
    activo: 1
  });

  const isAdmin = hasRole([ROLES.ADMIN]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await veterinariosService.getAll();
      setVeterinarios(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error cargando equipo veterinario' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (vet = null) => {
    if (vet) {
      setEditingId(vet.id_veterinario || vet.id);
      setFormData({
        nombre: vet.nombre || '',
        email: vet.email || '',
        usuario: vet.usuario || '',
        contraseña: '',
        activo: vet.activo !== undefined ? vet.activo : 1
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        email: '',
        usuario: '',
        contraseña: '',
        activo: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id_veterinario: editingId || undefined
      };
      if (editingId) {
        await veterinariosService.update(editingId, payload);
        setAlert({ type: 'success', message: 'Datos del veterinario actualizados correctamente' });
      } else {
        await veterinariosService.create(payload);
        setAlert({ type: 'success', message: 'Médico veterinario registrado en MySQL con éxito' });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al guardar veterinario' });
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Confirma eliminar al médico veterinario ${nombre}?`)) return;
    try {
      await veterinariosService.delete(id);
      setAlert({ type: 'success', message: 'Registro veterinario eliminado' });
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar veterinario' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Equipo Médico Veterinario</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Profesionales a cargo de los planes sanitarios y bioseguridad del hato
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            👨‍⚕️ Registrar Veterinario
          </button>
        )}
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Personal Médico Registrado</h3>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando personal médico...
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Usuario</th>
                  <th>Fecha de Registro</th>
                  <th>Estado</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {veterinarios.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay veterinarios registrados.
                    </td>
                  </tr>
                ) : (
                  veterinarios.map((v) => {
                    const vId = v.id_veterinario || v.id;
                    return (
                      <tr key={vId}>
                        <td style={{ fontWeight: 600 }}>{v.nombre}</td>
                        <td>{v.email}</td>
                        <td>{v.usuario}</td>
                        <td>{v.fecha_registro ? String(v.fecha_registro).slice(0, 10) : '-'}</td>
                        <td>
                          <span className={`status-pill ${Number(v.activo) === 1 ? 'activo' : 'inactivo'}`}>
                            {Number(v.activo) === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ marginRight: '0.5rem' }}
                              onClick={() => handleOpenModal(v)}
                            >
                              ✏️ Editar
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vId, v.nombre)}>
                              🗑️
                            </button>
                          </td>
                        )}
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
        title={editingId ? 'Editar Veterinario' : 'Registrar Nuevo Veterinario'}
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

          <div className="form-grid-2">
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
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
              />
            </div>
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
              <label className="form-label">Estado</label>
              <select
                className="form-control"
                value={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: Number(e.target.value) })}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Actualizar' : 'Guardar Veterinario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
