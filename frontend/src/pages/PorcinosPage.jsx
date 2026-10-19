import React, { useState, useEffect } from 'react';
import { porcinosService } from '../api/porcinos.service';
import { inventarioService } from '../api/inventario.service';
import { useAuth, ROLES } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

export const PorcinosPage = () => {
  const { hasRole, user } = useAuth();
  const [porcinos, setPorcinos] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    identificacion: '',
    raza: 'Landrace',
    peso: '',
    estado_salud: 'Saludable',
    fecha_nacimiento: '',
    genero: 'Macho',
    id_corral: '',
    veterinario_id: ''
  });

  const canEdit = hasRole([ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO]);
  const canDelete = hasRole([ROLES.ADMIN, ROLES.VETERINARIO]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [porcinosData, vetsData, corralesData] = await Promise.all([
        porcinosService.getAll().catch(() => []),
        porcinosService.getVeterinariosList().catch(() => []),
        inventarioService.getCorrales().catch(() => [])
      ]);
      setPorcinos(Array.isArray(porcinosData) ? porcinosData : porcinosData.data || []);
      setVeterinarios(Array.isArray(vetsData) ? vetsData : vetsData.data || []);
      setCorrales(Array.isArray(corralesData) ? corralesData : corralesData.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al cargar los porcinos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (porcino = null) => {
    if (porcino) {
      setEditingId(porcino.id_porcino || porcino.id);
      setFormData({
        identificacion: porcino.identificacion || '',
        raza: porcino.raza || 'Landrace',
        peso: porcino.peso || '',
        estado_salud: porcino.estado_salud || 'Saludable',
        fecha_nacimiento: porcino.fecha_nacimiento ? porcino.fecha_nacimiento.slice(0, 10) : '',
        genero: porcino.genero || 'Macho',
        id_corral: porcino.id_corral || '',
        veterinario_id: porcino.veterinario_id || porcino.id_veterinario || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        identificacion: `POR-${Math.floor(1000 + Math.random() * 9000)}`,
        raza: 'Landrace',
        peso: '',
        estado_salud: 'Saludable',
        fecha_nacimiento: new Date().toISOString().slice(0, 10),
        genero: 'Macho',
        id_corral: corrales[0]?.id_corral || corrales[0]?.id || '',
        veterinario_id: veterinarios[0]?.id_veterinario || veterinarios[0]?.id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id_corral: formData.id_corral ? parseInt(formData.id_corral, 10) : null,
        veterinario_id: formData.veterinario_id ? parseInt(formData.veterinario_id, 10) : null
      };
      if (editingId) {
        await porcinosService.update(editingId, payload);
        setAlert({ type: 'success', message: 'Porcino actualizado exitosamente' });
      } else {
        await porcinosService.create(payload);
        setAlert({ type: 'success', message: 'Porcino registrado exitosamente en el sistema' });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al guardar los datos del porcino' });
    }
  };

  const handleDelete = async (id, identificacion) => {
    if (!window.confirm(`¿Confirma eliminar el registro del porcino ${identificacion}?`)) return;
    try {
      await porcinosService.delete(id);
      setAlert({ type: 'success', message: `Porcino ${identificacion} eliminado correctamente` });
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar el porcino' });
    }
  };

  const filteredPorcinos = porcinos.filter(
    (p) =>
      p.identificacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.raza?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCerdos = porcinos.length;
  const saludables = porcinos.filter((p) => p.estado_salud === 'Saludable').length;
  const enTratamiento = porcinos.filter((p) => p.estado_salud?.toLowerCase().includes('tratamiento') || p.estado_salud?.toLowerCase().includes('enfermo')).length;
  const pesoPromedio = totalCerdos > 0
    ? (porcinos.reduce((acc, curr) => acc + Number(curr.peso || 0), 0) / totalCerdos).toFixed(1)
    : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Gestión de Porcinos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Inventario general, estado biológico y trazabilidad del hato
          </p>
        </div>

        {canEdit && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            ➕ Registrar Nuevo Porcino
          </button>
        )}
      </div>

      <Alert
        type={alert?.type}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />

      {/* Indicadores / Métricas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            🐷
          </div>
          <div>
            <div className="stat-value">{totalCerdos}</div>
            <div className="stat-label">Total Cerdos Registrados</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            🛡️
          </div>
          <div>
            <div className="stat-value">{saludables}</div>
            <div className="stat-label">Estado Saludable</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
            🩹
          </div>
          <div>
            <div className="stat-value">{enTratamiento}</div>
            <div className="stat-label">En Tratamiento / Enfermos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            ⚖️
          </div>
          <div>
            <div className="stat-value">{pesoPromedio} kg</div>
            <div className="stat-label">Peso Promedio</div>
          </div>
        </div>
      </div>

      {/* Tabla con Búsqueda */}
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Listado de Animales</h3>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '300px' }}
            placeholder="Buscar por código o raza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando registros...
            </p>
          ) : filteredPorcinos.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron registros de porcinos.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Identificación</th>
                  <th>Raza</th>
                  <th>Peso (kg)</th>
                  <th>Género</th>
                  <th>Nacimiento</th>
                  <th>Salud</th>
                  <th>Corral Asignado</th>
                  <th>Veterinario Asignado</th>
                  {canEdit && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPorcinos.map((p) => {
                  const pId = p.id_porcino || p.id;
                  const corralText = p.corral_nombre || (p.id_corral ? `Corral #${p.id_corral}` : 'Sin asignar');
                  return (
                    <tr key={pId}>
                      <td style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{p.identificacion}</td>
                      <td>{p.raza}</td>
                      <td>{p.peso} kg</td>
                      <td>{p.genero}</td>
                      <td>{p.fecha_nacimiento ? String(p.fecha_nacimiento).slice(0, 10) : '-'}</td>
                      <td>
                        <span className={`status-pill ${p.estado_salud?.toLowerCase().includes('salud') ? 'saludable' : 'enfermo'}`}>
                          {p.estado_salud}
                        </span>
                      </td>
                      <td>🏠 {corralText}</td>
                      <td>{p.veterinario_nombre ? `👨‍⚕️ ${p.veterinario_nombre}` : 'Sin asignar'}</td>
                      {canEdit && (
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ marginRight: '0.5rem' }}
                            onClick={() => handleOpenModal(p)}
                          >
                            ✏️ Editar
                          </button>
                          {canDelete && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(pId, p.identificacion)}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Registrar/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Porcino' : 'Registrar Nuevo Porcino'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Identificación / Arete</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Raza</label>
              <select
                className="form-control"
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              >
                <option value="Landrace">Landrace</option>
                <option value="Yorkshire">Yorkshire</option>
                <option value="Duroc">Duroc</option>
                <option value="Pietrain">Pietrain</option>
                <option value="Criollo">Criollo</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                required
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Género</label>
              <select
                className="form-control"
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Fecha de Nacimiento</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado de Salud</label>
              <select
                className="form-control"
                value={formData.estado_salud}
                onChange={(e) => setFormData({ ...formData, estado_salud: e.target.value })}
              >
                <option value="Saludable">Saludable</option>
                <option value="En Tratamiento">En Tratamiento</option>
                <option value="Enfermo">Enfermo</option>
                <option value="En Observación">En Observación</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Corral Asignado</label>
            <select
              className="form-control"
              value={formData.id_corral}
              onChange={(e) => setFormData({ ...formData, id_corral: e.target.value })}
            >
              <option value="">-- Sin Corral Asignado --</option>
              {corrales.map((c) => (
                <option key={c.id_corral || c.id} value={c.id_corral || c.id}>
                  🏠 {c.nombre} (Cap: {c.capacidad})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Veterinario Responsable</label>
            <select
              className="form-control"
              value={formData.veterinario_id}
              onChange={(e) => setFormData({ ...formData, veterinario_id: e.target.value })}
            >
              <option value="">-- Sin Asignar --</option>
              {veterinarios.map((v) => (
                <option key={v.id_veterinario || v.id} value={v.id_veterinario || v.id}>
                  👨‍⚕️ {v.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Actualizar Porcino' : 'Guardar en MySQL'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
