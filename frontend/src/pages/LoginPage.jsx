import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

export const LoginPage = () => {
  // ✅ TODA LA LÓGICA DE ESTADO INTACTA
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [identificador, setIdentificador] = useState('admin@sigepor.com');
  const [contraseña, setContraseña] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleConfigs = [
    { id: ROLES.ADMIN,       label: 'Admin',      icon: '👑', defaultUser: 'admin@sigepor.com'    },
    { id: ROLES.VETERINARIO, label: 'Veterinario', icon: '🩺', defaultUser: 'vet@sigepor.com'      },
    { id: ROLES.EMPLEADO,    label: 'Empleado',    icon: '👷', defaultUser: 'operario@sigepor.com' },
    { id: ROLES.CLIENTE,     label: 'Cliente',     icon: '👤', defaultUser: 'cliente@sigepor.com'  }
  ];

  // ✅ LÓGICA INTACTA: handleRoleSelect, handleSubmit, login(), navigate()
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
      const loggedUser = await login(identificador, contraseña);

      let defaultDestination = '/porcinos';
      if (Number(loggedUser?.idRol) === 3) {
        defaultDestination = '/vacunas';
      } else if (Number(loggedUser?.idRol) === 4) {
        defaultDestination = '/reportes';
      }

      const destination = location.state?.from?.pathname || defaultDestination;
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
        {/* Encabezado con logo */}
        <div className="login-header">
          <img src="/logo.jpg" alt="SIGEPOR" className="login-logo" />
          <h1>SIGEPOR</h1>
          <p>Sistema de Gestión Integral Porcícola</p>
        </div>

        {/* Cuerpo del formulario */}
        <div style={{ padding: '1.75rem 2rem 2.25rem' }}>

          {/* Selector de roles */}
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            Selecciona tu perfil de acceso:
          </p>

          <div className="role-tabs">
            {roleConfigs.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`role-tab-btn${selectedRole === r.id ? ' active' : ''}`}
                onClick={() => handleRoleSelect(r.id, r.defaultUser)}
              >
                <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Alerta de error */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Formulario de autenticación */}
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
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
              disabled={loading}
            >
              {loading ? '⏳ Verificando credenciales...' : '🔐 Iniciar Sesión'}
            </button>
          </form>

          {/* Footer del login */}
          <div style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'rgba(148,163,184,0.5)',
            letterSpacing: '0.03em'
          }}>
            Control de Acceso RBAC · SIGEPOR 2026
          </div>
        </div>
      </div>
    </div>
  );
};
