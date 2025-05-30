import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/authService";

/**
 * Componente Dashboard
 * - Muestra la información del perfil del usuario.
 * - Obtiene los datos desde el backend, incluyendo el avatar.
 * - Si la sesión no es válida, redirige al usuario al login.
 */
const Dashboard = () => {
  const [user, setUser] = useState(null); // Estado para almacenar datos del usuario

  useEffect(() => {
    // Obtiene el perfil del usuario desde el backend
    fetchWithAuth("http://localhost:5000/api/perfil")
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => {
        sessionStorage.removeItem("accessToken"); // Elimina el token de sesión si hay un error
        localStorage.removeItem("refreshToken"); // Remueve el token de actualización
        window.location.href = "/login"; // Redirige al login en caso de error
      });
  }, []);

  return (
    <div>
      <h2>Bienvenido, {user?.name}</h2> {/* Muestra el nombre del usuario */}
      <img src={user?.avatar} alt="Avatar" width="100" /> {/* Muestra el avatar del usuario */}
      <p>Correo: {user?.email}</p> {/* Muestra el correo del usuario */}
      <button onClick={() => window.location.href = "/logout"}>Cerrar sesión</button> {/* Botón para cerrar sesión */}
    </div>
  );
};

export default Dashboard; // Exporta el componente para su uso en otras partes de la aplicación
