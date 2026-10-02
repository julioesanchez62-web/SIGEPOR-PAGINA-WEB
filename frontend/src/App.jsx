import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Páginas
import { LoginPage } from './pages/LoginPage';
import { PorcinosPage } from './pages/PorcinosPage';
import { VacunasPage } from './pages/VacunasPage';
import { ReproduccionPage } from './pages/ReproduccionPage';
import { InventarioPage } from './pages/InventarioPage';
import { VeterinariosPage } from './pages/VeterinariosPage';
import { ReportesPage } from './pages/ReportesPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      {/* Ruta Pública: Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas dentro del Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/porcinos" replace />} />

        {/* Porcinos: Acceso para Admin, Vet, Empleado y Cliente */}
        <Route
          path="porcinos"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO, ROLES.CLIENTE]}>
              <PorcinosPage />
            </ProtectedRoute>
          }
        />

        {/* Sanidad y Vacunas: Exclusivo Admin y Veterinario */}
        <Route
          path="vacunas"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VETERINARIO]}>
              <VacunasPage />
            </ProtectedRoute>
          }
        />

        {/* Reproducción: Admin, Veterinario y Empleado */}
        <Route
          path="reproduccion"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO]}>
              <ReproduccionPage />
            </ProtectedRoute>
          }
        />

        {/* Inventario: Admin, Veterinario y Empleado */}
        <Route
          path="inventario"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO]}>
              <InventarioPage />
            </ProtectedRoute>
          }
        />

        {/* Veterinarios: Admin, Veterinario y Empleado */}
        <Route
          path="veterinarios"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VETERINARIO, ROLES.EMPLEADO]}>
              <VeterinariosPage />
            </ProtectedRoute>
          }
        />

        {/* Reportes y Alertas: Admin y Veterinario */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VETERINARIO]}>
              <ReportesPage />
            </ProtectedRoute>
          }
        />

        {/* Gestión de Usuarios: EXCLUSIVO Administrador */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />

        {/* Control de Acceso Denegado (403) */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Ruta no encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback global */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
