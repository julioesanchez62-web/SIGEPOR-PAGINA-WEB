import React, { useState, useEffect } from 'react';
import { sanidadService } from '../api/sanidad.service';
import { porcinosService } from '../api/porcinos.service';
import { useAuth, ROLES } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

export const VacunasPage = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('vacunas');
  const [vacunas, setVacunas] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [porcinos, setPorcinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modales
  const [isVacunaModalOpen, setIsVacunaModalOpen] = useState(false);
  const [isEnfermedadModalOpen, setIsEnfermedadModalOpen] = useState(false);

  const [vacunaForm, setVacunaForm] = useState({
    porcino_id: '',
    nombre_vacuna: 'Peste Porcina Clásica',
    fecha_aplicacion: new Date().toISOString().slice(0, 10),
    dosis: '2.0',
    proxima_vacuna_dias: 21,
    estado: 'Aplicada',
    notas: ''
  });

  const [enfermedadForm, setEnfermedadForm] = useState({
    porcino_id: '',
    tipo_enfermedad: 'Neumonía Enzoótica',
    fecha_diagnostico: new Date().toISOString().slice(0, 10),
    tratamiento: 'Antibiótico de amplio espectro por 5 días',
    estado: 'En Tratamiento'
  });

  const canManage = hasRole([ROLES.ADMIN, ROLES.VETERINARIO]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vacData, enfData, porcData] = await Promise.all([
        sanidadService.getVacunas().catch(() => []),
        sanidadService.getEnfermedades().catch(() => []),
        porcinosService.getAll().catch(() => [])
      ]);
      setVacunas(Array.isArray(vacData) ? vacData : vacData.data || []);
      setEnfermedades(Array.isArray(enfData) ? enfData : enfData.data || []);
      const pList = Array.isArray(porcData) ? porcData : porcData.data || [];
      setPorcinos(pList);
      if (pList.length > 0) {
        setVacunaForm((prev) => ({ ...prev, porcino_id: pList[0].id }));
        setEnfermedadForm((prev) => ({ ...prev, porcino_id: pList[0].id }));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error cargando datos de sanidad' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVacuna = async (e) => {
    e.preventDefault();
    try {
      await sanidadService.createVacuna(vacunaForm);
      setAlert({ type: 'success', message: 'Vacuna registrada y programada exitosamente' });
      setIsVacunaModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error registrando vacuna' });
    }
  };

  const handleDeleteVacuna = async (id) => {
    if (!window.confirm('¿Confirma eliminar este registro de vacunación?')) return;
    try {
      await sanidadService.deleteVacuna(id);
      setAlert({ type: 'success', message: 'Registro de vacunación eliminado' });
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar vacuna' });
    }
  };

  const handleCreateEnfermedad = async (e) => {
    e.preventDefault();
    try {
      await sanidadService.createEnfermedad(enfermedadForm);
      setAlert({ type: 'success', message: 'Diagnóstico de enfermedad registrado' });
      setIsEnfermedadModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error registrando diagnóstico' });
    }
  };

  const handleDeleteEnfermedad = async (id) => {
    if (!window.confirm('¿Confirma eliminar este reporte médico?')) return;
    try {
      await sanidadService.deleteEnfermedad(id);
      setAlert({ type: 'success', message: 'Registro médico eliminado' });
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar reporte médico' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Sanidad, Vacunación y Enfermedades</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Control veterinario preventivo y seguimiento de tratamientos clínicos
          </p>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => setIsVacunaModalOpen(true)}>
              💉 Registrar Vacuna
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEnfermedadModalOpen(true)}>
              🩹 Registrar Diagnóstico
            </button>
          </div>
        )}
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Indicadores */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            💉
          </div>
          <div>
            <div className="stat-value">{vacunas.length}</div>
            <div className="stat-label">Total Dosis Aplicadas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
            🦠
          </div>
          <div>
            <div className="stat-value">{enfermedades.length}</div>
            <div className="stat-label">Enfermedades Diagnosticadas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            🛡️
          </div>
          <div>
            <div className="stat-value">98%</div>
            <div className="stat-label">Efectividad Sanitaria</div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'vacunas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('vacunas')}
        >
          💉 Historial de Vacunación ({vacunas.length})
        </button>
        <button
          className={`btn ${activeTab === 'enfermedades' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('enfermedades')}
        >
          🦠 Cuadro Clínico y Tratamientos ({enfermedades.length})
        </button>
      </div>

      {activeTab === 'vacunas' ? (
        <div className="table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Porcino (ID/Arete)</th>
                  <th>Vacuna</th>
                  <th>Dosis (ml)</th>
                  <th>Fecha Aplicación</th>
                  <th>Próxima Dosis (días)</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  {canManage && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {vacunas.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay registros de vacunación.
                    </td>
                  </tr>
                ) : (
                  vacunas.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.porcino_identificacion || `Porcino #${v.porcino_id}`}</td>
                      <td>{v.nombre_vacuna}</td>
                      <td>{v.dosis} ml</td>
                      <td>{v.fecha_aplicacion ? String(v.fecha_aplicacion).slice(0, 10) : '-'}</td>
                      <td>{v.proxima_vacuna_dias || 14} días</td>
                      <td>
                        <span className="status-pill aplicada">{v.estado || 'Aplicada'}</span>
                      </td>
                      <td>{v.notas || 'Sin observaciones'}</td>
                      {canManage && (
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteVacuna(v.id)}>
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
      ) : (
        <div className="table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Porcino</th>
                  <th>Enfermedad / Síntoma</th>
                  <th>Fecha Diagnóstico</th>
                  <th>Tratamiento Prescrito</th>
                  <th>Estado</th>
                  {canManage && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {enfermedades.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay reportes de enfermedades activos.
                    </td>
                  </tr>
                ) : (
                  enfermedades.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.porcino_identificacion || `Porcino #${e.porcino_id}`}</td>
                      <td>{e.tipo_enfermedad}</td>
                      <td>{e.fecha_diagnostico ? String(e.fecha_diagnostico).slice(0, 10) : '-'}</td>
                      <td>{e.tratamiento}</td>
                      <td>
                        <span className="status-pill tratamiento">{e.estado}</span>
                      </td>
                      {canManage && (
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEnfermedad(e.id)}>
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
      )}

      {/* Modal Registrar Vacuna */}
      <Modal isOpen={isVacunaModalOpen} onClose={() => setIsVacunaModalOpen(false)} title="Aplicar Nueva Vacuna">
        <form onSubmit={handleCreateVacuna}>
          <div className="form-group">
            <label className="form-label">Seleccionar Porcino</label>
            <select
              className="form-control"
              required
              value={vacunaForm.porcino_id}
              onChange={(e) => setVacunaForm({ ...vacunaForm, porcino_id: e.target.value })}
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
              <label className="form-label">Nombre de Vacuna</label>
              <input
                type="text"
                className="form-control"
                required
                value={vacunaForm.nombre_vacuna}
                onChange={(e) => setVacunaForm({ ...vacunaForm, nombre_vacuna: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dosis (ml)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                required
                value={vacunaForm.dosis}
                onChange={(e) => setVacunaForm({ ...vacunaForm, dosis: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Fecha de Aplicación</label>
              <input
                type="date"
                className="form-control"
                required
                value={vacunaForm.fecha_aplicacion}
                onChange={(e) => setVacunaForm({ ...vacunaForm, fecha_aplicacion: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Próxima Dosis (días)</label>
              <input
                type="number"
                className="form-control"
                value={vacunaForm.proxima_vacuna_dias}
                onChange={(e) => setVacunaForm({ ...vacunaForm, proxima_vacuna_dias: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones / Lote</label>
            <textarea
              className="form-control"
              rows="2"
              value={vacunaForm.notas}
              onChange={(e) => setVacunaForm({ ...vacunaForm, notas: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsVacunaModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Vacuna
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Diagnóstico */}
      <Modal isOpen={isEnfermedadModalOpen} onClose={() => setIsEnfermedadModalOpen(false)} title="Registrar Diagnóstico Médico">
        <form onSubmit={handleCreateEnfermedad}>
          <div className="form-group">
            <label className="form-label">Porcino Afectado</label>
            <select
              className="form-control"
              required
              value={enfermedadForm.porcino_id}
              onChange={(e) => setEnfermedadForm({ ...enfermedadForm, porcino_id: e.target.value })}
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
              <label className="form-label">Enfermedad / Diagnóstico</label>
              <input
                type="text"
                className="form-control"
                required
                value={enfermedadForm.tipo_enfermedad}
                onChange={(e) => setEnfermedadForm({ ...enfermedadForm, tipo_enfermedad: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Diagnóstico</label>
              <input
                type="date"
                className="form-control"
                required
                value={enfermedadForm.fecha_diagnostico}
                onChange={(e) => setEnfermedadForm({ ...enfermedadForm, fecha_diagnostico: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tratamiento y Medicamento Prescrito</label>
            <textarea
              className="form-control"
              rows="3"
              required
              value={enfermedadForm.tratamiento}
              onChange={(e) => setEnfermedadForm({ ...enfermedadForm, tratamiento: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEnfermedadModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Reporte Médico
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
