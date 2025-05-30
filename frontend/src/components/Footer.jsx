import React from "react"; // Importa React para definir el componente de pie de página

/**
 * Componente Footer
 * - Muestra el mensaje de derechos reservados en la parte inferior de la página.
 */
const Footer = () => {
  return (
    <footer className="footer"> {/* Contenedor del pie de página */}
      <p>© 2025 Blockbuster | Todos los derechos reservados</p> {/* Texto con derechos reservados */}
    </footer>
  );
};

export default Footer; // Exporta el componente para su uso en otras partes de la aplicación
