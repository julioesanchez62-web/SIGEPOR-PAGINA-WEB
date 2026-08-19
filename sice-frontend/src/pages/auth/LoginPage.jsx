import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
  });
  const [message, setMessage] = useState("");
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
    setMessage("");

    if (!formData.correo || !formData.contrasena) {
      setMessage("Correo y contraseña son obligatorios.");
      return;
    }

    try {
      setIsLoading(true);
      await login(formData);
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "No fue posible iniciar sesión.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h1>SICE</h1>
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
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

        {message && <p className="error-message">{message}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
