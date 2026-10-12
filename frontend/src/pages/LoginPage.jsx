import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

export const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [identificador, setIdentificador] = useState('admin@sigepor.com');
  const [contraseña, setContraseña] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleConfigs = [
    { id: ROLES.ADMIN, label: 'Administrador', icon: '👑', defaultUser: 'admin@sigepor.com' },
    { id: ROLES.VETERINARIO, label: 'Veterinario', icon: '👨‍⚕️', defaultUser: 'vet@sigepor.com' },
    { id: ROLES.EMPLEADO, label: 'Empleado', icon: '👷', defaultUser: 'operario@sigepor.com' },
    { id: ROLES.CLIENTE, label: 'Cliente', icon: '🛒', defaultUser: 'cliente@sigepor.com' }
  ];

  const handleRoleSelect = (roleId, defaultEmail) => {
    setSelectedRole(roleId);
    setIdentificador(defaultEmail);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identificador.trim() || !contraseña.trim()) {
      setError('Por favor complete usuario/correo y contraseña');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(identificador, contraseña);

      const destination = location.state?.from?.pathname || '/porcinos';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message || 'Credenciales incorrectas. Verifique correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.jpg" alt="SIGEPOR" className="login-logo" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            SIGEPOR
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Sistema de Gestión Integral Porcícola
          </p>
        </div>

        <div style={{ padding: '1.75rem 2rem 2.25rem' }}>
          <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            Selecciona tu perfil de acceso:
          </p>

          <div className="role-tabs">
            {roleConfigs.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`role-tab-btn ${selectedRole === r.id ? 'active' : ''}`}
                onClick={() => handleRoleSelect(r.id, r.defaultUser)}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo electrónico o Usuario</label>
              <input
                type="text"
                className="form-control"
                placeholder="ejemplo@sigepor.com"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Control de Acceso Basado en Roles (RBAC) &bull; SIGEPOR 2026
          </div>
        </div>
      </div>
    </div>
  );
};
