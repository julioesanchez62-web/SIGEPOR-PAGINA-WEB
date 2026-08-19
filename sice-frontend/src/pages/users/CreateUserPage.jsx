import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usersService from "../../services/users.service";
import ROLE_IDS from "../../constants/roles";

const ROLE_OPTIONS = [
  { idRol: ROLE_IDS.SYSTEM_ADMIN, label: "Administrador del sistema" },
  { idRol: ROLE_IDS.HR_ANALYST, label: "Analista de Recursos Humanos" },
  { idRol: ROLE_IDS.APPLICANT, label: "Aspirante" },
  { idRol: ROLE_IDS.HR_DIRECTOR, label: "Director de Recursos Humanos" },
];

function CreateUserPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    idRol: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    if (
      !formData.nombre ||
      !formData.correo ||
      !formData.contrasena ||
      !formData.idRol
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      setIsLoading(true);
      await usersService.createUser({
        ...formData,
        idRol: Number(formData.idRol),
      });
      navigate("/users");
    } catch (createError) {
      setError(
        createError.response?.data?.message ||
          "No fue posible crear el usuario.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="create-user-page">
      <h2>Crear usuario</h2>

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

        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          value={formData.contrasena}
          onChange={handleChange}
        />

        <label htmlFor="idRol">Rol</label>
        <select
          id="idRol"
          name="idRol"
          value={formData.idRol}
          onChange={handleChange}
        >
          <option value="">Seleccione un rol</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.idRol} value={role.idRol}>
              {role.label}
            </option>
          ))}
        </select>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}

export default CreateUserPage;
