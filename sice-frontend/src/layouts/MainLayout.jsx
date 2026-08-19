import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ROLE_IDS from "../constants/roles";

function MainLayout() {
  const { user, logout } = useAuth();

  const canViewUsers = [
    ROLE_IDS.SYSTEM_ADMIN,
    ROLE_IDS.HR_ANALYST,
    ROLE_IDS.HR_DIRECTOR,
  ].includes(user?.idRol);

  return (
    <div className="main-layout">
      <header className="main-header">
        <h1>SICE</h1>
        <span>
          {user?.nombre} - {user?.rol}
        </span>
        <button type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <nav className="main-nav">
        <Link to="/dashboard">Dashboard</Link>
        {" | "}
        <Link to="/profile">Mi perfil</Link>
        {canViewUsers && (
          <>
            {" | "}
            <Link to="/users">Usuarios</Link>
          </>
        )}
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
