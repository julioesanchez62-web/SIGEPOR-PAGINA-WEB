import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNetworkSync } from '../context/NetworkSyncContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncPendingRequests } = useNetworkSync();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (idRol) => {
    switch (Number(idRol)) {
      case 1: return 'role-tag admin';
      case 3: return 'role-tag vet';
      case 2: return 'role-tag emp';
      case 4: return 'role-tag cli';
      default: return 'role-tag emp';
    }
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>🐖</span>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Panel de Control Porcícola
        </h2>
      </div>

      <div className="user-menu">
        {/* Indicador de Red y Sincronización PWA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSyncing ? (
            <span className="status-pill observacion" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              🔄 Sincronizando...
            </span>
          ) : !isOnline ? (
            <span className="status-pill enfermo" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              📡 Modo Offline {pendingCount > 0 ? `(${pendingCount} pend.)` : ''}
            </span>
          ) : pendingCount > 0 ? (
            <button
              onClick={syncPendingRequests}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#fef3c7', borderColor: '#fde68a', color: '#92400e' }}
              title="Clic para sincronizar con MySQL"
            >
              ⚠️ {pendingCount} pendiente(s) &bull; Sincronizar
            </button>
          ) : (
            <span className="status-pill saludable" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
              🟢 En línea
            </span>
          )}
        </div>

        <div className="user-badge">
          <span style={{ fontWeight: 600 }}>{user?.nombre || 'Usuario'}</span>
          <span className={getRoleBadgeClass(user?.idRol)}>
            {user?.rolNombre || 'Empleado'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          title="Cerrar sesión"
        >
          🚪 Salir
        </button>
      </div>
    </header>
  );
};
