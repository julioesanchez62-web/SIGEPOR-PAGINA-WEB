import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import usersService from "../../services/users.service";

function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  async function loadUser() {
    try {
      setIsLoading(true);
      const result = await usersService.getUserById(id);
      setUser(result.data);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "No fue posible cargar el usuario.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <p>Cargando usuario...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="user-detail-page">
      <h2>Detalle de usuario</h2>
      <p>Nombre: {user?.nombre}</p>
      <p>Correo: {user?.correo}</p>
      <p>Rol: {user?.rol}</p>
      <p>Estado: {user?.estado === 1 ? "Activo" : "Inactivo"}</p>
      <Link to="/users">Volver</Link>
    </div>
  );
}

export default UserDetailPage;
