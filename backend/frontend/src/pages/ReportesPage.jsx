import React, { useState, useEffect } from 'react';
import { reportesService } from '../api/reportes.service';
import { Alert } from '../components/Alert';

export const ReportesPage = () => {
  const [alertas, setAlertas] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState('ALL');

  // Estado para la consulta de trazabilidad
  const [trazabilidadId, setTrazabilidadId] = useState('');
  const [trazabilidadData, setTrazabilidadData] = useState(null);
  const [loadingTrazabilidad, setLoadingTrazabilidad] = useState(false);

  useEffect(() => {
    loadAlertas();
  }, []);

  // Función para normalizar la estructura dinámica de alertas devuelta por el backend
  const normalizarAlertas = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    const dataObj = raw.data || raw;
    if (Array.isArray(dataObj)) return dataObj;

    const listaCombinada = [];

    // 1. Salud General: Porcinos con estado de salud anormal
    if (Array.isArray(dataObj.salud)) {
      dataObj.salud.forEach((p) => {
        listaCombinada.push({
          id: `salud-${p.id_porcino || p.id}`,
          tipo: 'Crítica',
          categoria: 'Sanidad Animal',
          mensaje: `Porcino #${p.identificacion || p.id} (${p.raza || 'Porcino'}) reporta estado: '${p.estado_salud}'. Requiere atención veterinaria.`,
          fecha: p.fecha || new Date().toISOString().slice(0, 10),
          estado: p.estado_salud
        });
      });
    }

    // 2. Diagnósticos de Enfermedades en tratamiento activo
    if (Array.isArray(dataObj.enfermedades)) {
      dataObj.enfermedades.forEach((e) => {
        listaCombinada.push({
          id: `enf-${e.id}`,
          tipo: 'Crítica',
          categoria: 'Sanidad Animal',
          mensaje: `Tratamiento Activo: Porcino #${e.identificacion} diagnosticado con '${e.tipo_enfermedad}'. Tratamiento: ${e.tratamiento} (Estado: ${e.estado}).`,
          fecha: e.fecha_diagnostico || new Date().toISOString().slice(0, 10),
          estado: e.estado
        });
      });
    }

    // 3. Módulo de Vacunación: Vacunas pendientes, retrasadas o con refuerzo
    if (Array.isArray(dataObj.vacunacion)) {
      dataObj.vacunacion.forEach((v) => {
        const esCritica = v.estado?.toLowerCase() === 'retrasada';
        listaCombinada.push({
          id: `vac-${v.id}`,
          tipo: esCritica ? 'Crítica' : 'Urgente',
          categoria: 'Vacunación',
          mensaje: `Dosis ${v.dosis ? `${v.dosis}ml de ` : ''}${v.nombre_vacuna} (${v.estado}) para porcino #${v.identificacion}${v.proxima_vacuna_dias ? ` • Próximo refuerzo en ${v.proxima_vacuna_dias} días` : ''}.`,
          fecha: v.fecha_aplicacion || new Date().toISOString().slice(0, 10),
          estado: v.estado
        });
      });
    }

    // 4. Módulo de Reproducción: Partos próximos estimados
    if (Array.isArray(dataObj.reproduccion)) {
      dataObj.reproduccion.forEach((r) => {
        listaCombinada.push({
          id: `rep-${r.id}`,
          tipo: 'Informativa',
          categoria: 'Reproducción',
          mensaje: `Parto próximo para hembra #${r.identificacion} (${r.tipo_evento}). Fecha estimada: ${r.fecha_probable_parto}${r.observaciones ? ` • ${r.observaciones}` : ''}.`,
          fecha: r.fecha_probable_parto || new Date().toISOString().slice(0, 10),
          estado: 'Gestación'
        });
      });
    }

    // 5. Módulo de Inventario: Alimentos por agotarse (stock crítico <= 30 kg)
    if (Array.isArray(dataObj.inventario)) {
      dataObj.inventario.forEach((a) => {
        listaCombinada.push({
          id: `inv-${a.id}`,
          tipo: 'Crítica',
          categoria: 'Inventario',
          mensaje: `⚠️ Alimento crítico por agotarse: '${a.tipo_alimento}' tiene solo ${a.cantidad || 0} kg disponibles en ${a.corral || 'granja'}. Proveedor: ${a.proveedor || 'No especificado'}.`,
          fecha: a.fecha_suministro || new Date().toISOString().slice(0, 10),
          estado: 'Stock Bajo'
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
        message: err.message || 'No fue posible conectar con el servicio de alertas sanitarias y operativas.' 
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

  // Filtrar alertas según la pestaña seleccionada
  const filteredAlertas = alertas.filter((a) => {
    if (selectedCategoria === 'ALL') return true;
    return a.categoria?.toLowerCase().includes(selectedCategoria.toLowerCase());
  });

  const countByCat = (cat) => alertas.filter((a) => a.categoria?.toLowerCase().includes(cat.toLowerCase())).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reportes Operativos y Alertas Sanitarias</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Monitorización en tiempo real de sanidad animal, vacunas pendientes, partos próximos e inventario crítico.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadAlertas}>
          🔄 Actualizar Alertas
        </button>
      </div>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Tarjetas de Métricas Rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div 
          onClick={() => setSelectedCategoria('ALL')}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: selectedCategoria === 'ALL' ? '2px solid var(--primary, #15803d)' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🚨 Total Alertas Activas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{alertas.length}</div>
        </div>

        <div 
          onClick={() => setSelectedCategoria('Sanidad')}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: selectedCategoria === 'Sanidad' ? '2px solid #ef4444' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🩺 Sanidad y Enfermedades</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{countByCat('Sanidad')}</div>
        </div>

        <div 
          onClick={() => setSelectedCategoria('Vacunación')}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: selectedCategoria === 'Vacunación' ? '2px solid #f59e0b' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💉 Vacunas por Aplicar</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{countByCat('Vacunación')}</div>
        </div>

        <div 
          onClick={() => setSelectedCategoria('Reproducción')}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: selectedCategoria === 'Reproducción' ? '2px solid #8b5cf6' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🧬 Partos Próximos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>{countByCat('Reproducción')}</div>
        </div>

        <div 
          onClick={() => setSelectedCategoria('Inventario')}
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: selectedCategoria === 'Inventario' ? '2px solid #dc2626' : '1px solid var(--border, #e2e8f0)',
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🌾 Inventario Crítico</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>{countByCat('Inventario')}</div>
        </div>
      </div>

      {/* Tabla de Alertas del Sistema */}
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <h3 className="table-title">
            {selectedCategoria === 'ALL' ? 'Alertas Sanitarias y Operativas del Sistema' : `Alertas de: ${selectedCategoria}`}
          </h3>
        </div>

        <div className="table-wrapper">
          {loadingAlertas ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Comprobando alertas sanitarias y operativas desde MySQL...
            </p>
          ) : filteredAlertas.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              ✅ No hay alertas críticas registradas en esta categoría. Operación en condiciones óptimas.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Severidad</th>
                  <th>Módulo / Categoría</th>
                  <th>Mensaje / Notificación de Alerta</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlertas.map((a, idx) => (
                  <tr key={a.id || idx}>
                    <td>
                      <span className={`status-pill ${a.tipo?.toLowerCase() === 'crítica' || a.tipo?.toLowerCase() === 'urgente' ? 'enfermo' : 'observacion'}`}>
                        {a.tipo || 'Informativa'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.categoria || 'General'}</td>
                    <td style={{ fontWeight: 500 }}>{a.mensaje || a.titulo}</td>
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
              placeholder="Ingrese código o ID del porcino (ej. TEST-E2E-4140)..."
              value={trazabilidadId}
              onChange={(e) => setTrazabilidadId(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loadingTrazabilidad}>
              {loadingTrazabilidad ? 'Buscando...' : 'Consultar'}
            </button>
          </form>

          {trazabilidadData && (
            <div style={{ background: 'var(--card-bg, #f8fafc)', padding: '1.25rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border, #e2e8f0)' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary-dark, #15803d)' }}>
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
                  <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>💉 Vacunas Registradas:</h5>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                    {(trazabilidadData.vacunas || trazabilidadData.historial?.vacunas || []).map((v, i) => (
                      <li key={i}>{v.nombre_vacuna} ({v.fecha_aplicacion ? String(v.fecha_aplicacion).slice(0, 10) : ''}) - Dosis: {v.dosis}ml - Estado: {v.estado}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enfermedades */}
              {((trazabilidadData.enfermedades && trazabilidadData.enfermedades.length > 0) || 
                (trazabilidadData.historial?.enfermedades && trazabilidadData.historial.enfermedades.length > 0)) && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>🩺 Diagnósticos y Tratamientos:</h5>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                    {(trazabilidadData.enfermedades || trazabilidadData.historial?.enfermedades || []).map((e, i) => (
                      <li key={i}>{e.tipo_enfermedad} ({e.fecha_diagnostico ? String(e.fecha_diagnostico).slice(0, 10) : ''}) - Tratamiento: {e.tratamiento} ({e.estado})</li>
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
                      <li key={i}>{ev.tipo_evento} ({ev.fecha_evento ? String(ev.fecha_evento).slice(0, 10) : ''}) - Parto estimado: {ev.fecha_probable_parto ? String(ev.fecha_probable_parto).slice(0, 10) : 'N/A'}</li>
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
