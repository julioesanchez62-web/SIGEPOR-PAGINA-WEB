import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNetworkSync } from '../context/NetworkSyncContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncPendingRequests } = useNetworkSync();
  const navigate = useNavigate();

  // ✅ LÓGICA INTACTA: handleLogout, getRoleBadgeClass
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
      {/* Título de sección */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.2rem' }}>🐖</span>
        <h2>Panel de Control Porcícola</h2>
      </div>

      <div className="user-menu">
        {/* ✅ LÓGICA INTACTA: Indicador de red PWA / Sincronización */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSyncing ? (
            <span className="status-pill observacion" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              🔄 Sincronizando...
            </span>
          ) : !isOnline ? (
            <span className="status-pill enfermo" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              📡 Offline {pendingCount > 0 ? `(${pendingCount} pend.)` : ''}
            </span>
          ) : pendingCount > 0 ? (
            <button
              onClick={syncPendingRequests}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                background: 'rgba(245,158,11,0.15)',
                borderColor: 'rgba(245,158,11,0.3)',
                color: '#fbbf24'
              }}
              title="Clic para sincronizar con MySQL"
            >
              ⚡ {pendingCount} pendiente(s) · Sincronizar
            </button>
          ) : (
            <span
              className="status-pill saludable"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
            >
              <span className="pulse-dot" />
              En línea
            </span>
          )}
        </div>

        {/* Badge de usuario con rol */}
        <div className="user-badge">
          <span style={{ fontWeight: 700 }}>{user?.nombre || 'Usuario'}</span>
          <span className={getRoleBadgeClass(user?.idRol)}>
            {user?.rolNombre || 'Empleado'}
          </span>
        </div>

        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-sm"
          title="Cerrar sesión"
        >
          🚪 Salir
        </button>
      </div>
    </header>
  );
};
