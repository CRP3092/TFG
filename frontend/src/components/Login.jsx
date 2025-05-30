import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import config from "../utils/config";
import "../styles/styles.css";

/**
 * Componente Login
 * - Permite la autenticación de usuario mediante email y contraseña.
 * - Verifica y almacena el usuario en sessionStorage.
 */
const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();

  // Redirecciona a la página principal tras el login exitoso
  if (redirect) {
    return <Navigate to="/index" />;
  }

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Envía las credenciales al backend para autenticación
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${config.API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al iniciar sesión.");
      }

      const { token, user } = responseData;

      if (!token) {
        return;
      }

      // Normalizar la URL del avatar si no es completa
      if (!user.avatar || user.avatar === "undefined") {
        user.avatar = `${config.API_URL}/uploads/avatars/default-avatar.jpg`;
      } else if (!user.avatar.startsWith("http")) {
        user.avatar = `${config.API_URL}${user.avatar}`;
      }

      // Guardar usuario y token en sessionStorage
      sessionStorage.setItem("accessToken", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      navigate("/index");

      // Manejo alternativo en caso de problemas de redirección
      setTimeout(() => {
        if (window.location.pathname !== "/index") {
          window.location.href = "/index";
        }
      }, 500);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Iniciar Sesión</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Correo" onChange={handleChange} required />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              required
            />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <button type="submit">Ingresar</button>
        </form>
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
