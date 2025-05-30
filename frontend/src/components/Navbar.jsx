import { Link } from "react-router-dom"; // Importa Link para la navegación entre páginas

/**
 * Componente Navbar
 * - Muestra enlaces de navegación a distintas secciones de la aplicación.
 */
const Navbar = () => {
  return (
    <nav> {/* Contenedor principal de la barra de navegación */}
      <Link to="/">Inicio</Link> {/* Enlace a la página principal */}
      <Link to="/register">Registro</Link> {/* Enlace a la página de registro */}
      <Link to="/login">Iniciar Sesión</Link> {/* Enlace a la página de inicio de sesión */}
      <Link to="/dashboard">Mi Perfil</Link> {/* Enlace a la página del perfil del usuario */}
    </nav>
  );
};

export default Navbar; // Exporta el componente para ser utilizado en otras partes de la aplicación
