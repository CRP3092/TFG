import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/portada.css"; // Importa los estilos del contenido

/**
 * Componente Portada
 * - Muestra una pantalla de bienvenida con botones para iniciar sesión o registrarse.
 * - Utiliza una imagen de fondo definida en el entorno de `PUBLIC_URL`.
 */
const Portada = () => {
  const navigate = useNavigate(); // Hook para la navegación entre páginas

  // Estilos en línea para el contenedor de la portada con imagen de fondo
  const backgroundStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/uploads/background.jpg)`, // Imagen de fondo
    backgroundRepeat: "no-repeat", // Evita que la imagen se repita
    backgroundPosition: "center", // Centra la imagen
    backgroundSize: "cover", // Ajusta la imagen al tamaño del contenedor
    height: "100vh", // Ocupa toda la altura de la pantalla
    width: "100%", // Ocupa todo el ancho disponible
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <div style={backgroundStyle}> {/* Contenedor principal con imagen de fondo */}
      <div className="portada-content"> {/* Contenedor del contenido */}
        <h1>Bienvenido a BlockBuster</h1> {/* Título de la página */}
        <p>Descubre, explora y disfruta de tus series y películas favoritas.</p> {/* Mensaje de bienvenida */}
        <div className="portada-buttons"> {/* Contenedor de los botones */}
          <button onClick={() => navigate("/login")}>Iniciar Sesión</button> {/* Botón de login */}
          <button onClick={() => navigate("/register")}>Registrarse</button> {/* Botón de registro */}
        </div>
      </div>
    </div>
  );
};

export default Portada; // Exporta el componente para su uso en otras partes de la aplicación
