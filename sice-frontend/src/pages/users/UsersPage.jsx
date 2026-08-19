import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import usersService from "../../services/users.service";
import ROLE_IDS from "../../constants/roles";

function UsersPage() {
  const { user: authenticatedUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = authenticatedUser?.idRol === ROLE_IDS.SYSTEM_ADMIN;

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const result = await usersService.getUsers();
      setUsers(result.data);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "No fue posible cargar los usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleStatus(user) {
    const action = user.estado === 1 ? "desactivar" : "activar";

    if (!window.confirm(`¿Seguro que deseas ${action} a ${user.nombre}?`)) {
      return;
    }

    try {
      await usersService.updateUserStatus(user.idUsuario, user.estado !== 1);
      await loadUsers();
    } catch (statusError) {
      setError(
        statusError.response?.data?.message ||
          "No fue posible actualizar el estado.",
      );
    }
  }

  async function handleDelete(user) {
    if (
      !window.confirm(`¿Seguro que deseas eliminar a ${user.nombre}?`)
    ) {
      return;
    }

    try {
      await usersService.deleteUser(user.idUsuario);
      await loadUsers();
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          "No fue posible eliminar el usuario.",
      );
    }
  }

  if (isLoading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <div className="users-page">
      <h2>Usuarios</h2>

      {error && <p className="error-message">{error}</p>}

      {isAdmin && (
        <p>
          <Link to="/users/new">Crear usuario</Link>
        </p>
      )}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.idUsuario}>
              <td>{user.nombre}</td>
              <td>{user.correo}</td>
              <td>{user.rol}</td>
              <td>{user.estado === 1 ? "Activo" : "Inactivo"}</td>
              <td>
                <Link to={`/users/${user.idUsuario}`}>Ver</Link>
                {isAdmin && (
                  <>
                    {" | "}
                    <Link to={`/users/${user.idUsuario}/edit`}>Editar</Link>
                    {" | "}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.estado === 1 ? "Desactivar" : "Activar"}
                    </button>
                    {" | "}
                    <button type="button" onClick={() => handleDelete(user)}>
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersPage;
