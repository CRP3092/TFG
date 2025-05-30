import { useEffect } from "react";

/**
 * Componente Logout
 * - Elimina el token de sesión almacenado en `sessionStorage`.
 * - Elimina el token de actualización de `localStorage`.
 * - Envía una solicitud al backend para cerrar la sesión.
 * - Redirige al usuario a la página de login.
 */
const Logout = () => {
  useEffect(() => {
    sessionStorage.removeItem("accessToken"); // Elimina el token de acceso almacenado en sessionStorage
    localStorage.removeItem("refreshToken"); // Remueve el token de actualización en localStorage

    // Llama a la API para cerrar sesión en el backend y luego redirige al login
    fetch("http://localhost:5000/api/logout", { method: "POST" })
      .finally(() => {
        window.location.href = "/login"; // Redirección a la pantalla de login
      });
  }, []);

  return <h2>Cerrando sesión...</h2>; // Mensaje temporal mientras se cierra sesión
};

export default Logout; // Exporta el componente para ser utilizado en la aplicación
