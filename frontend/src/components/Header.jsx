import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import config from "../utils/config";

/**
 * Componente Header
 * - Muestra el logo, navegación y menú de usuario.
 * - Gestiona el estado de sesión y la lógica de cierre de sesión.
 */
const Header = () => {
  const navigate = useNavigate(); // Hook para redireccionamiento entre páginas
  const location = useLocation(); // Obtiene la ruta actual

  // Determina si la página actual es de autenticación (login/register)
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/cerrar el menú desplegable
  const [user, setUser] = useState(null); // Estado para almacenar datos del usuario

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user"); // Obtiene la información del usuario desde sessionStorage

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser); // Convierte la información del usuario en un objeto

      // Normalizar la URL del avatar si no es una URL completa
    if (parsedUser.avatar && !parsedUser.avatar.startsWith("http")) {
      parsedUser.avatar = `${config.API_URL}${parsedUser.avatar}`;
    } else {
      parsedUser.avatar = `${config.API_URL}/uploads/avatars/7309681.jpg`; // Imagen por defecto si no tiene avatar
    }

      setUser(parsedUser); // Actualiza el estado del usuario con los datos procesados
    } else {
      setUser(null); // Si no hay usuario en sesión, establece el estado como null
    }
  }, [location]); // Se ejecuta cada vez que cambia la ubicación de la página

  // 🔹 Función para cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem("accessToken"); // Elimina el token de acceso
    sessionStorage.removeItem("user"); // Elimina los datos del usuario
    localStorage.removeItem("refreshToken"); // Remueve el token de actualización
    navigate("/login"); // Redirecciona al usuario a la página de inicio de sesión
  };

  return (
    <header className="header">
      <div className="logo-container">
        {isAuthPage ? (
          // Si el usuario está en login/register, se muestra el logo sin enlace
          <img
            src={`${config.API_URL}/uploads/assets/logo.jpg`}
            alt="Blockbuster Logo"
            className="logo"
          />
        ) : (
          // En otras páginas, el logo es clickeable y redirige al índice
          <Link to="/index" className="logo">
            <img
              src={`${config.API_URL}/uploads/assets/logo.jpg`}
              alt="Blockbuster Logo"
            />
          </Link>
        )}
      </div>

      {!isAuthPage && (
        <>
          {/* Navegación general del usuario */}
          <nav className="nav-links">
            <Link to="/series">Series</Link>
            <Link to="/peliculas">Películas</Link>
            <Link to="/milista">Mi Lista</Link>
          </nav>

          {/* Opciones de administración, visibles solo para usuarios con rol "admin" */}
          {user?.role === "admin" && (
            <nav className="admin-nav">
              <Link to="/admin/dashboard">Panel Admin</Link>
              <Link to="/admin/users">Gestionar Usuarios</Link>
            </nav>
          )}

          {/* Información del usuario y menú desplegable */}
          {user && (
            <div className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              <img src={user.avatar} alt="Avatar" className="avatar-icon" />
              {menuOpen && (
                <div className="dropdown-menu">
                  {/*
                  <Link to="/add-profile">Añadir perfil</Link>
                  */}
                  <Link to="/edit-profile">Editar perfil</Link>
                  <Link to={`/usuario/${user.id}`}>Mi perfil</Link>
                  <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </header>
  );
};

export default Header;
