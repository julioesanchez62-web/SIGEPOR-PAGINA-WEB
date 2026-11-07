import React, { useState, useEffect } from 'react';
import { reproduccionService } from '../api/reproduccion.service';
import { porcinosService } from '../api/porcinos.service';
import { useAuth, ROLES } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

export const ReproduccionPage = () => {
  const { hasRole } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [porcinos, setPorcinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    porcino_id: '',
    tipo_evento: 'Inseminación Artificial',
    fecha_evento: new Date().toISOString().slice(0, 10),
    fecha_probable_parto: '',
    lechones_nacidos: 0,
    observaciones: ''
  });

  const canManage = hasRole([ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO]);
  const canDelete = hasRole([ROLES.ADMIN, ROLES.VETERINARIO]);

  // Calcular fecha probable de parto (~114 días para cerdas)
  const handleFechaEventoChange = (fecha) => {
    const d = new Date(fecha);
    d.setDate(d.getDate() + 114);
    const probable = d.toISOString().slice(0, 10);
    setFormData({
      ...formData,
      fecha_evento: fecha,
      fecha_probable_parto: probable
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [evData, pData] = await Promise.all([
        reproduccionService.getEventos().catch(() => []),
        porcinosService.getAll().catch(() => [])
      ]);
      setEventos(Array.isArray(evData) ? evData : evData.data || []);
      const hembras = (Array.isArray(pData) ? pData : pData.data || []).filter(
        (p) => p.genero?.toLowerCase() === 'hembra' || !p.genero
      );
      setPorcinos(hembras);
      if (hembras.length > 0) {
        setFormData((prev) => ({ ...prev, porcino_id: hembras[0].id }));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error cargando eventos reproductivos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleFechaEventoChange(new Date().toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reproduccionService.createEvento(formData);
      setAlert({ type: 'success', message: 'Evento reproductivo registrado con éxito' });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al guardar evento reproductivo' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirma eliminar este evento reproductivo?')) return;
    try {
      await reproduccionService.deleteEvento(id);
      setAlert({ type: 'success', message: 'Evento reproductivo eliminado' });
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar evento' });
    }
  };

  const totalPartos = eventos.filter((e) => e.tipo_evento?.toLowerCase().includes('parto')).length;
  const totalLechones = eventos.reduce((acc, curr) => acc + Number(curr.lechones_nacidos || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Control de Reproducción y Partos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Ciclos de celo, montas, inseminación, gestación y nacimientos de camadas
          </p>
        </div>

        {canManage && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            🧬 Registrar Evento Reproductivo
          </button>
        )}
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Indicadores */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            🧬
          </div>
          <div>
            <div className="stat-value">{eventos.length}</div>
            <div className="stat-label">Eventos Registrados</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            🎉
          </div>
          <div>
            <div className="stat-value">{totalPartos}</div>
            <div className="stat-label">Partos Asistidos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            🐷
          </div>
          <div>
            <div className="stat-value">{totalLechones}</div>
            <div className="stat-label">Lechones Nacidos</div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Historial Reproductivo</h3>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Madre (ID / Arete)</th>
                <th>Tipo de Evento</th>
                <th>Fecha de Evento</th>
                <th>Fecha Probable de Parto</th>
                <th>Lechones Nacidos</th>
                <th>Observaciones</th>
                {canDelete && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay eventos reproductivos registrados.
                  </td>
                </tr>
              ) : (
                eventos.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600 }}>{ev.porcino_identificacion || `Madre #${ev.porcino_id}`}</td>
                    <td>{ev.tipo_evento}</td>
                    <td>{ev.fecha_evento ? String(ev.fecha_evento).slice(0, 10) : '-'}</td>
                    <td style={{ color: 'var(--secondary)' }}>
                      {ev.fecha_probable_parto ? String(ev.fecha_probable_parto).slice(0, 10) : '-'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{ev.lechones_nacidos || 0}</td>
                    <td>{ev.observaciones || 'Sin detalles'}</td>
                    {canDelete && (
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)}>
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Evento Reproductivo">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Madre / Cerda Reproductora</label>
            <select
              className="form-control"
              required
              value={formData.porcino_id}
              onChange={(e) => setFormData({ ...formData, porcino_id: e.target.value })}
            >
              {porcinos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.identificacion} ({p.raza})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tipo de Evento</label>
              <select
                className="form-control"
                value={formData.tipo_evento}
                onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
              >
                <option value="Inseminación Artificial">Inseminación Artificial</option>
                <option value="Monta Natural">Monta Natural</option>
                <option value="Diagnóstico de Gestación">Diagnóstico de Gestación</option>
                <option value="Parto">Parto</option>
                <option value="Destete">Destete</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha del Evento</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.fecha_evento}
                onChange={(e) => handleFechaEventoChange(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Fecha Probable de Parto (+114 días)</label>
              <input
                type="date"
                className="form-control"
                value={formData.fecha_probable_parto}
                onChange={(e) => setFormData({ ...formData, fecha_probable_parto: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lechones Nacidos Vivos</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.lechones_nacidos}
                onChange={(e) => setFormData({ ...formData, lechones_nacidos: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-control"
              rows="2"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Evento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
