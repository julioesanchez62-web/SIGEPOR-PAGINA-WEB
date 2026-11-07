import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

export const Sidebar = () => {
  const { hasRole } = useAuth();

  const navItems = [
    {
      to: '/porcinos',
      label: 'Porcinos',
      icon: '🐷',
      roles: [ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO, ROLES.CLIENTE]
    },
    {
      to: '/vacunas',
      label: 'Sanidad y Vacunas',
      icon: '💉',
      roles: [ROLES.ADMIN, ROLES.VETERINARIO]
    },
    {
      to: '/reproduccion',
      label: 'Reproducción',
      icon: '🧬',
      roles: [ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO]
    },
    {
      to: '/inventario',
      label: 'Inventario',
      icon: '📦',
      roles: [ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO]
    },
    {
      to: '/veterinarios',
      label: 'Veterinarios',
      icon: '👨‍⚕️',
      roles: [ROLES.ADMIN]
    },
    {
      to: '/reportes',
      label: 'Reportes y Alertas',
      icon: '📊',
      roles: [ROLES.ADMIN, ROLES.VETERINARIO]
    },
    {
      to: '/usuarios',
      label: 'Gestión Usuarios',
      icon: '👥',
      roles: [ROLES.ADMIN]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Logo + Marca */}
      <div className="sidebar-header">
        <img src="/logo.jpg" alt="SIGEPOR" className="sidebar-logo" />
        <div>
          <div className="sidebar-title">SIGEPOR</div>
          <div className="sidebar-sub">Gestión Porcícola</div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        {navItems
          .filter((item) => hasRole(item.roles))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* Pie del sidebar */}
      <div style={{
        padding: '1rem 1.2rem',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        fontSize: '0.72rem',
        color: 'rgba(148,163,184,0.45)',
        textAlign: 'center',
        letterSpacing: '0.03em'
      }}>
        SIGEPOR v2.0 · 2026
      </div>
    </aside>
  );
};
