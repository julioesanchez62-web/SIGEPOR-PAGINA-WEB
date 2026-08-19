import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usersService from "../../services/users.service";
import ROLE_IDS from "../../constants/roles";

const ROLE_OPTIONS = [
  { idRol: ROLE_IDS.SYSTEM_ADMIN, label: "Administrador del sistema" },
  { idRol: ROLE_IDS.HR_ANALYST, label: "Analista de Recursos Humanos" },
  { idRol: ROLE_IDS.APPLICANT, label: "Aspirante" },
  { idRol: ROLE_IDS.HR_DIRECTOR, label: "Director de Recursos Humanos" },
];

function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    idRol: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  async function loadUser() {
    try {
      setIsLoading(true);
      const result = await usersService.getUserById(id);

      setFormData({
        nombre: result.data.nombre,
        correo: result.data.correo,
        idRol: result.data.idRol,
      });
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "No fue posible cargar el usuario.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setIsSaving(true);
      await usersService.updateUser(id, {
        ...formData,
        idRol: Number(formData.idRol),
      });
      navigate("/users");
    } catch (updateError) {
      setError(
        updateError.response?.data?.message ||
          "No fue posible actualizar el usuario.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="edit-user-page">
      <h2>Editar usuario</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
        />

        <label htmlFor="correo">Correo</label>
        <input
          id="correo"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={handleChange}
        />

        <label htmlFor="idRol">Rol</label>
        <select
          id="idRol"
          name="idRol"
          value={formData.idRol}
          onChange={handleChange}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role.idRol} value={role.idRol}>
              {role.label}
            </option>
          ))}
        </select>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export default EditUserPage;
