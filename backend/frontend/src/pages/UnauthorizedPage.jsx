import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⛔</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '0.5rem' }}>
        Acceso Denegado (403 Forbidden)
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
        Tu rol actual (<strong>{user?.rolNombre || 'Sin rol'}</strong>) no cuenta con los permisos necesarios para acceder a este módulo del sistema SIGEPOR.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/porcinos')}>
          Ir al Panel Principal
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Regresar
        </button>
      </div>
    </div>
  );
};
