import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de Protección de Rutas con control de acceso por roles (RBAC)
 * @param {Array<number|string>} allowedRoles Roles permitidos para ver esta ruta
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <p style={{ fontWeight: 600, color: '#16a34a' }}>Cargando SIGEPOR...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir a Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especificaron roles y el usuario no cuenta con ellos, redirigir a /unauthorized
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    console.warn(`Acceso denegado a ${location.pathname} para el rol: ${user?.rolNombre} (id: ${user?.idRol})`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
