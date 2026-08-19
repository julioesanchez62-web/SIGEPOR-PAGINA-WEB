import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import ROLE_IDS from "./constants/roles";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/profile/ProfilePage";
import UsersPage from "./pages/users/UsersPage";
import CreateUserPage from "./pages/users/CreateUserPage";
import UserDetailPage from "./pages/users/UserDetailPage";
import EditUserPage from "./pages/users/EditUserPage";

const USERS_MODULE_ROLES = [
  ROLE_IDS.SYSTEM_ADMIN,
  ROLE_IDS.HR_ANALYST,
  ROLE_IDS.HR_DIRECTOR,
];

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={USERS_MODULE_ROLES}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <RoleRoute allowedRoles={[ROLE_IDS.SYSTEM_ADMIN]}>
              <CreateUserPage />
            </RoleRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <RoleRoute allowedRoles={USERS_MODULE_ROLES}>
              <UserDetailPage />
            </RoleRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <RoleRoute allowedRoles={[ROLE_IDS.SYSTEM_ADMIN]}>
              <EditUserPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
