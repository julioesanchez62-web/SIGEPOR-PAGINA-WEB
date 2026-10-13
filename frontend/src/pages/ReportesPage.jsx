import React, { useState, useEffect } from 'react';
import { reportesService } from '../api/reportes.service';
import { Alert } from '../components/Alert';

export const ReportesPage = () => {
  const [alertas, setAlertas] = useState([]);
  const [trazabilidadId, setTrazabilidadId] = useState('');
  const [trazabilidadData, setTrazabilidadData] = useState(null);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [loadingTrazabilidad, setLoadingTrazabilidad] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadAlertas();
  }, []);

  // Función auxiliar para normalizar la estructura devuelta por el backend
  const normalizarAlertas = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    const dataObj = raw.data || raw;
    if (Array.isArray(dataObj)) return dataObj;

    // Si viene agrupado como { salud: [], reproduccion: [], vacunacion: [] }
    const listaCombinada = [];
    if (Array.isArray(dataObj.salud)) {
      dataObj.salud.forEach((p) => {
        listaCombinada.push({
          tipo: 'Crítica',
          categoria: 'Salud Animal',
          mensaje: `Porcino #${p.identificacion || p.id} (${p.raza || 'General'}) se encuentra en estado: ${p.estado_salud}`,
          fecha: new Date().toISOString()
        });
      });
    }
    if (Array.isArray(dataObj.vacunacion)) {
      dataObj.vacunacion.forEach((v) => {
        listaCombinada.push({
          tipo: 'Urgente',
          categoria: 'Vacunación',
          mensaje: `Vacuna ${v.nombre_vacuna} pendiente para porcino #${v.identificacion || v.porcino_id}`,
          fecha: v.fecha_aplicacion || new Date().toISOString()
        });
      });
    }
    if (Array.isArray(dataObj.reproduccion)) {
      dataObj.reproduccion.forEach((r) => {
        listaCombinada.push({
          tipo: 'Informativa',
          categoria: 'Reproducción',
          mensaje: `Parto próximo para hembra #${r.identificacion || r.porcino_id} (Fecha estimada: ${r.fecha_probable_parto})`,
          fecha: r.fecha_probable_parto || new Date().toISOString()
        });
      });
    }

    return listaCombinada;
  };

  const loadAlertas = async () => {
    try {
      setLoadingAlertas(true);
      const data = await reportesService.getAlertas();
      const lista = normalizarAlertas(data);
      setAlertas(lista);
    } catch (err) {
      console.error('Error al cargar alertas en Reportes:', err);
      setAlert({ 
        type: 'danger', 
        message: err.message || 'No fue posible conectar con el servicio de alertas. Mostrando estado por defecto.' 
      });
      setAlertas([]);
    } finally {
      setLoadingAlertas(false);
    }
  };

  const handleBuscarTrazabilidad = async (e) => {
    e.preventDefault();
    if (!trazabilidadId.trim()) return;

    try {
      setLoadingTrazabilidad(true);
      const data = await reportesService.getTrazabilidad(trazabilidadId);
      setTrazabilidadData(data.data || data);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || `No se encontró trazabilidad para el ID ${trazabilidadId}` });
      setTrazabilidadData(null);
    } finally {
      setLoadingTrazabilidad(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reportes Operativos y Alertas Sanitarias</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Monitorización de eventos críticos, vacunaciones pendientes y trazabilidad zootécnica
        </p>
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Alertas del Sistema */}
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <h3 className="table-title">🚨 Alertas Sanitarias y Operativas del Sistema</h3>
          <button className="btn btn-secondary btn-sm" onClick={loadAlertas}>
            🔄 Actualizar
          </button>
        </div>

        <div className="table-wrapper">
          {loadingAlertas ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Comprobando alertas sanitarias...
            </p>
          ) : alertas.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              ✅ No hay alertas críticas registradas en este momento. Hato en óptimas condiciones.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Severidad</th>
                  <th>Mensaje / Notificación</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`status-pill ${a.tipo?.toLowerCase() === 'critica' || a.tipo?.toLowerCase() === 'urgente' ? 'enfermo' : 'observacion'}`}>
                        {a.tipo || 'Informativa'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{a.mensaje || a.titulo}</td>
                    <td>{a.categoria || 'Sanidad'}</td>
                    <td>{a.fecha ? String(a.fecha).slice(0, 10) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Consulta de Trazabilidad */}
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">🔍 Hoja de Vida y Trazabilidad por Animal</h3>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={handleBuscarTrazabilidad} style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Ingrese código o ID del porcino (ej. 1 o POR-101)..."
              value={trazabilidadId}
              onChange={(e) => setTrazabilidadId(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loadingTrazabilidad}>
              {loadingTrazabilidad ? 'Buscando...' : 'Consultar'}
            </button>
          </form>

          {trazabilidadData && (
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>
                Ficha Técnica: {trazabilidadData.porcino?.identificacion || `Porcino #${trazabilidadId}`}
              </h4>

              <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
                <div><strong>Raza:</strong> {trazabilidadData.porcino?.raza || 'N/A'}</div>
                <div><strong>Peso:</strong> {trazabilidadData.porcino?.peso ? `${trazabilidadData.porcino.peso} kg` : 'N/A'}</div>
                <div><strong>Estado de Salud:</strong> {trazabilidadData.porcino?.estado_salud || 'N/A'}</div>
                <div><strong>Género:</strong> {trazabilidadData.porcino?.genero || 'N/A'}</div>
              </div>

              {/* Vacunas aplicadas */}
              {((trazabilidadData.vacunas && trazabilidadData.vacunas.length > 0) || 
                (trazabilidadData.historial?.vacunas && trazabilidadData.historial.vacunas.length > 0)) && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>💉 Vacunas Aplicadas:</h5>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                    {(trazabilidadData.vacunas || trazabilidadData.historial?.vacunas || []).map((v, i) => (
                      <li key={i}>{v.nombre_vacuna} ({v.fecha_aplicacion ? String(v.fecha_aplicacion).slice(0, 10) : ''}) - Dosis: {v.dosis}ml</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Eventos reproductivos */}
              {((trazabilidadData.eventos && trazabilidadData.eventos.length > 0) || 
                (trazabilidadData.historial?.reproduccion && trazabilidadData.historial.reproduccion.length > 0)) && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>🧬 Eventos Reproductivos:</h5>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                    {(trazabilidadData.eventos || trazabilidadData.historial?.reproduccion || []).map((ev, i) => (
                      <li key={i}>{ev.tipo_evento} ({ev.fecha_evento ? String(ev.fecha_evento).slice(0, 10) : ''}) - Lechones nacidos: {ev.lechones_nacidos || 0}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
