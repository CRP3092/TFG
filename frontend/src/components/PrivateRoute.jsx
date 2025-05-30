import { Navigate, Outlet } from "react-router-dom"; // Importa funciones de React Router para la navegación

/**
 * Componente PrivateRoute
 * - Protege rutas restringidas y redirige a la página de inicio de sesión si no hay un token válido.
 */
const PrivateRoute = () => {
  const token = sessionStorage.getItem("accessToken"); // Obtiene el token almacenado en sessionStorage

  return token ? <Outlet /> : <Navigate to="/login" replace />; // Si el usuario tiene un token, permite el acceso; de lo contrario, lo redirige al login
};

export default PrivateRoute; // Exporta el componente para ser utilizado en otras partes de la aplicación
