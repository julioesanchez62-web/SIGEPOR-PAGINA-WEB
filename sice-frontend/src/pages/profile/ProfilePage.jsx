import { useEffect, useState } from "react";
import usersService from "../../services/users.service";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setIsLoading(true);
      const result = await usersService.getMyProfile();
      setProfile(result.data);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "No fue posible cargar el perfil.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <p>Cargando perfil...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="profile-page">
      <h2>Mi perfil</h2>
      <p>Nombre: {profile?.nombre}</p>
      <p>Correo: {profile?.correo}</p>
      <p>Rol: {profile?.rol}</p>
      <p>Estado: {profile?.estado === 1 ? "Activo" : "Inactivo"}</p>
    </div>
  );
}

export default ProfilePage;
