import { useEffect, useState } from "react";
import config from "../utils/config";
import "../styles/styles.css";

/**
 * Componente AdminUsers
 * - Permite a los administradores gestionar usuarios (listar, modificar, eliminar).
 * - Incluye paginación y búsqueda de usuarios.
 */
const AdminUsers = () => {
  const [users, setUsers] = useState([]); // Estado para almacenar la lista de usuarios
  const [currentPage, setCurrentPage] = useState(1); // Estado para gestionar la paginación
  const [usersPerPage, setUsersPerPage] = useState(5); // Número de usuarios por página
  const [searchQuery, setSearchQuery] = useState(""); // Estado para almacenar el filtro de búsqueda
  const [error, setError] = useState(""); // Estado para gestionar errores en la carga de usuarios
  const [selectedUser, setSelectedUser] = useState(null); // Estado para manejar la edición de usuarios
  const [editData, setEditData] = useState({ name: "", email: "", role: "" }); // Estado para almacenar datos modificados

  useEffect(() => {
    const fetchUsers = async () => {
      const accessToken = sessionStorage.getItem("accessToken"); // Obtiene el token desde sessionStorage

      if (!accessToken) {
        setError("No hay token de autenticación. Inicia sesión nuevamente.");
        return;
      }

      try {
        // Llama a la API para obtener usuarios
        const response = await fetch(`${config.API_URL}/api/admin/users`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Error al obtener usuarios.");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUsers();
  }, []);

  // Maneja la selección de usuario para editar
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditData({ name: user.name, email: user.email, role: user.role });
  };

  // Maneja cambios en el formulario de edición
  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Actualiza un usuario en la base de datos
  const handleUpdate = async () => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      setError("No hay token de autenticación.");
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error("Error al actualizar usuario.");
      }

      // Actualiza la lista de usuarios con los nuevos datos
      setUsers(users.map(user => user.id === selectedUser.id ? { ...user, ...editData } : user));
      setSelectedUser(null);
    } catch (error) {
      setError(error.message);
    }
  };

  // Maneja la eliminación de un usuario
  const handleDelete = async (userId) => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      setError("No hay token de autenticación.");
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario.");
      }

      // Filtra la lista de usuarios eliminando el usuario eliminado
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reinicia a la primera página al cambiar el tamaño
  };
  const handleSearchChange = (e) => setSearchQuery(e.target.value.toLowerCase());

  // Filtra usuarios en base a la búsqueda
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery) ||
    user.email.toLowerCase().includes(searchQuery)
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="admin-container">
      <h1>Gestionar Usuarios</h1>
      {error && <p className="error-message">{error}</p>}

      {/* Buscador */}
      <input 
        type="text" 
        placeholder="Buscar usuario..." 
        onChange={handleSearchChange} 
        className="search-box"
      />

      {/* Tabla de usuarios */}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEditClick(user)}>Modificar</button>
                <button className="delete-btn" onClick={() => handleDelete(user.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botones de paginación */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, index) => (
          <button 
            key={index} 
            onClick={() => handlePageChange(index + 1)} 
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Selector de cantidad de usuarios por página */}
      <select onChange={handleUsersPerPageChange} value={usersPerPage}>
        <option value="5">5 por página</option>
        <option value="10">10 por página</option>
        <option value="25">25 por página</option>
      </select>
    </div>
  );
};

export default AdminUsers;
