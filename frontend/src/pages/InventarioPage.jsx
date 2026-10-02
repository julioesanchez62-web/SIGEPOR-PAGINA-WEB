import React, { useState, useEffect } from 'react';
import { inventarioService } from '../api/inventario.service';
import { useAuth, ROLES } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

export const InventarioPage = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('alimentos');
  const [alimentos, setAlimentos] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modales
  const [isAlimentoModal, setIsAlimentoModal] = useState(false);
  const [isCorralModal, setIsCorralModal] = useState(false);
  const [isProveedorModal, setIsProveedorModal] = useState(false);

  const [alimentoForm, setAlimentoForm] = useState({
    tipo_alimento: 'Concentrado Crecimiento',
    cantidad: 100,
    fecha_suministro: new Date().toISOString().slice(0, 10),
    proveedor: 'Agroinsumos del Llano',
    corral: 'Corral 1'
  });

  const [corralForm, setCorralForm] = useState({
    nombre: 'Corral 1',
    capacidad: 15,
    tipo_alimentacion: 'Concentrado Especial',
    estado_limpieza: 'Limpio',
    ubicacion: 'Nave Principal A'
  });

  const [proveedorForm, setProveedorForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const canManage = hasRole([ROLES.ADMIN, ROLES.EMPLEADO]);
  const isAdmin = hasRole([ROLES.ADMIN]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alData, crData, prData] = await Promise.all([
        inventarioService.getAlimentos().catch(() => []),
        inventarioService.getCorrales().catch(() => []),
        inventarioService.getProveedores().catch(() => [])
      ]);
      setAlimentos(Array.isArray(alData) ? alData : alData.data || []);
      setCorrales(Array.isArray(crData) ? crData : crData.data || []);
      setProveedores(Array.isArray(prData) ? prData : prData.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error cargando datos de inventario' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAlimento = async (e) => {
    e.preventDefault();
    try {
      await inventarioService.createAlimento(alimentoForm);
      setAlert({ type: 'success', message: 'Suministro de alimento registrado con éxito' });
      setIsAlimentoModal(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al registrar alimento' });
    }
  };

  const handleDeleteAlimento = async (id) => {
    if (!window.confirm('¿Desea eliminar este registro de alimento?')) return;
    try {
      await inventarioService.deleteAlimento(id);
      setAlert({ type: 'success', message: 'Registro de alimento eliminado' });
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al eliminar alimento' });
    }
  };

  const handleCreateCorral = async (e) => {
    e.preventDefault();
    try {
      await inventarioService.createCorral(corralForm);
      setAlert({ type: 'success', message: 'Nuevo corral configurado correctamente' });
      setIsCorralModal(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al registrar corral' });
    }
  };

  const handleCreateProveedor = async (e) => {
    e.preventDefault();
    try {
      await inventarioService.createProveedor(proveedorForm);
      setAlert({ type: 'success', message: 'Proveedor registrado exitosamente' });
      setIsProveedorModal(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Error al registrar proveedor' });
    }
  };

  const totalStockKg = alimentos.reduce((acc, curr) => acc + Number(curr.cantidad || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Inventario y Logística</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Control de raciones de alimentos, infraestructura de corrales y proveedores
          </p>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setIsAlimentoModal(true)}>
              🌾 Registrar Alimento
            </button>
            <button className="btn btn-secondary" onClick={() => setIsCorralModal(true)}>
              🏠 Nuevo Corral
            </button>
            {isAdmin && (
              <button className="btn btn-secondary" onClick={() => setIsProveedorModal(true)}>
                🚚 Nuevo Proveedor
              </button>
            )}
          </div>
        )}
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Indicadores */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            🌾
          </div>
          <div>
            <div className="stat-value">{totalStockKg.toLocaleString()} kg</div>
            <div className="stat-label">Total Alimento Suministrado</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            🏠
          </div>
          <div>
            <div className="stat-value">{corrales.length}</div>
            <div className="stat-label">Corrales Disponibles</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            🚚
          </div>
          <div>
            <div className="stat-value">{proveedores.length}</div>
            <div className="stat-label">Proveedores Aliados</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'alimentos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('alimentos')}
        >
          🌾 Alimentos ({alimentos.length})
        </button>
        <button
          className={`btn ${activeTab === 'corrales' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('corrales')}
        >
          🏠 Corrales ({corrales.length})
        </button>
        <button
          className={`btn ${activeTab === 'proveedores' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('proveedores')}
        >
          🚚 Proveedores ({proveedores.length})
        </button>
      </div>

      {activeTab === 'alimentos' && (
        <div className="table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tipo de Alimento</th>
                  <th>Cantidad (kg)</th>
                  <th>Fecha Suministro</th>
                  <th>Proveedor</th>
                  <th>Corral Destino</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {alimentos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay registros de alimentos.
                    </td>
                  </tr>
                ) : (
                  alimentos.map((al) => (
                    <tr key={al.id}>
                      <td style={{ fontWeight: 600 }}>{al.tipo_alimento}</td>
                      <td>{al.cantidad} kg</td>
                      <td>{al.fecha_suministro ? String(al.fecha_suministro).slice(0, 10) : '-'}</td>
                      <td>{al.proveedor || '-'}</td>
                      <td>{al.corral || '-'}</td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAlimento(al.id)}>
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

      {activeTab === 'corrales' && (
        <div className="table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre Corral</th>
                  <th>Capacidad Animales</th>
                  <th>Tipo Alimentación</th>
                  <th>Estado Limpieza</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {corrales.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay corrales registrados.
                    </td>
                  </tr>
                ) : (
                  corrales.map((cr) => (
                    <tr key={cr.id}>
                      <td style={{ fontWeight: 600 }}>{cr.nombre}</td>
                      <td>{cr.capacidad} cerdos</td>
                      <td>{cr.tipo_alimentacion}</td>
                      <td>
                        <span className={`status-pill ${cr.estado_limpieza?.toLowerCase() === 'limpio' ? 'limpio' : 'regular'}`}>
                          {cr.estado_limpieza || 'Limpio'}
                        </span>
                      </td>
                      <td>{cr.ubicacion || 'Principal'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'proveedores' && (
        <div className="table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre Proveedor</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay proveedores registrados.
                    </td>
                  </tr>
                ) : (
                  proveedores.map((pr) => (
                    <tr key={pr.id}>
                      <td style={{ fontWeight: 600 }}>{pr.nombre}</td>
                      <td>{pr.telefono || '-'}</td>
                      <td>{pr.email || '-'}</td>
                      <td>{pr.direccion || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Alimento */}
      <Modal isOpen={isAlimentoModal} onClose={() => setIsAlimentoModal(false)} title="Suministrar Alimento">
        <form onSubmit={handleCreateAlimento}>
          <div className="form-group">
            <label className="form-label">Tipo de Alimento</label>
            <input
              type="text"
              className="form-control"
              required
              value={alimentoForm.tipo_alimento}
              onChange={(e) => setAlimentoForm({ ...alimentoForm, tipo_alimento: e.target.value })}
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Cantidad (kg)</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                required
                value={alimentoForm.cantidad}
                onChange={(e) => setAlimentoForm({ ...alimentoForm, cantidad: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Suministro</label>
              <input
                type="date"
                className="form-control"
                required
                value={alimentoForm.fecha_suministro}
                onChange={(e) => setAlimentoForm({ ...alimentoForm, fecha_suministro: e.target.value })}
              />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Proveedor</label>
              <input
                type="text"
                className="form-control"
                value={alimentoForm.proveedor}
                onChange={(e) => setAlimentoForm({ ...alimentoForm, proveedor: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Corral Destino</label>
              <input
                type="text"
                className="form-control"
                value={alimentoForm.corral}
                onChange={(e) => setAlimentoForm({ ...alimentoForm, corral: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAlimentoModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar en Inventario
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Corral */}
      <Modal isOpen={isCorralModal} onClose={() => setIsCorralModal(false)} title="Registrar Corral">
        <form onSubmit={handleCreateCorral}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nombre del Corral</label>
              <input
                type="text"
                className="form-control"
                required
                value={corralForm.nombre}
                onChange={(e) => setCorralForm({ ...corralForm, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Capacidad (Animales)</label>
              <input
                type="number"
                className="form-control"
                required
                value={corralForm.capacidad}
                onChange={(e) => setCorralForm({ ...corralForm, capacidad: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Alimentación</label>
            <input
              type="text"
              className="form-control"
              value={corralForm.tipo_alimentacion}
              onChange={(e) => setCorralForm({ ...corralForm, tipo_alimentacion: e.target.value })}
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Estado de Limpieza</label>
              <select
                className="form-control"
                value={corralForm.estado_limpieza}
                onChange={(e) => setCorralForm({ ...corralForm, estado_limpieza: e.target.value })}
              >
                <option value="Limpio">Limpio</option>
                <option value="Regular">Regular</option>
                <option value="Requiere Aseo">Requiere Aseo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ubicación</label>
              <input
                type="text"
                className="form-control"
                value={corralForm.ubicacion}
                onChange={(e) => setCorralForm({ ...corralForm, ubicacion: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCorralModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Corral
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Proveedor */}
      <Modal isOpen={isProveedorModal} onClose={() => setIsProveedorModal(false)} title="Registrar Proveedor">
        <form onSubmit={handleCreateProveedor}>
          <div className="form-group">
            <label className="form-label">Nombre del Proveedor / Empresa</label>
            <input
              type="text"
              className="form-control"
              required
              value={proveedorForm.nombre}
              onChange={(e) => setProveedorForm({ ...proveedorForm, nombre: e.target.value })}
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                type="text"
                className="form-control"
                value={proveedorForm.telefono}
                onChange={(e) => setProveedorForm({ ...proveedorForm, telefono: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                value={proveedorForm.email}
                onChange={(e) => setProveedorForm({ ...proveedorForm, email: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              className="form-control"
              value={proveedorForm.direccion}
              onChange={(e) => setProveedorForm({ ...proveedorForm, direccion: e.target.value })}
            />
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsProveedorModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Proveedor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
