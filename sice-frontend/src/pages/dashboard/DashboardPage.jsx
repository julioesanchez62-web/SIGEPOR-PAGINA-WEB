import { useAuth } from "../../contexts/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <p>Bienvenido/a, {user?.nombre}.</p>
      <p>Rol: {user?.rol}</p>
    </div>
  );
}

export default DashboardPage;
