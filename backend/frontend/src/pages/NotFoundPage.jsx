import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        Página No Encontrada (404)
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
        La ruta a la que intentas acceder no existe en el sistema SIGEPOR o ha sido reubicada.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/porcinos')}>
        Ir a Porcinos
      </button>
    </div>
  );
};
