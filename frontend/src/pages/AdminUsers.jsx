import { useEffect, useState } from "react";
import config from "../utils/config";
import "../styles/styles.css";

/**
 * Componente AdminUsers
 * - Permite a los administradores gestionar usuarios (listar, modificar, eliminar).
 * - Incluye paginación, búsqueda de usuarios y edición en un modal interno.
 */
const AdminUsers = () => {
  const [users, setUsers] = useState([]); // Estado de usuarios
  const [currentPage, setCurrentPage] = useState(1); // Paginación
  const [usersPerPage, setUsersPerPage] = useState(5); // Cantidad por página
  const [searchQuery, setSearchQuery] = useState(""); // Filtro de búsqueda
  const [error, setError] = useState(""); // Manejo de errores
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado
  const [editData, setEditData] = useState({ name: "", email: "", role: "" }); // Datos de edición
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal interno

  useEffect(() => {
    const fetchUsers = async () => {
      const accessToken = sessionStorage.getItem("accessToken");

      if (!accessToken) {
        setError("No hay token de autenticación. Inicia sesión nuevamente.");
        return;
      }

      try {
        const response = await fetch(`${config.API_URL}/api/admin/users`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
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

  // Maneja la selección de usuario para edición
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditData({ name: user.name, email: user.email, role: user.role });
    setIsModalOpen(true);
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar usuario.");
      }

      setUsers(users.map(user => user.id === selectedUser.id ? { ...user, ...editData } : user));
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Maneja la eliminación de un usuario, evitando que el admin se elimine a sí mismo
  const handleDelete = async (userId) => {
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const currentUserId = currentUser.id || currentUser.Id_User;

    if (userId === currentUserId) {
      alert("❌ No puedes eliminar tu propia cuenta.");
      return;
    }

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
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario.");
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
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

      <input type="text" placeholder="Buscar usuario..." onChange={handleSearchChange} className="search-box" />

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

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)} className={currentPage === index + 1 ? "active" : ""}>
            {index + 1}
          </button>
        ))}
      </div>

      <select onChange={handleUsersPerPageChange} value={usersPerPage}>
        <option value="5">5 por página</option>
        <option value="10">10 por página</option>
        <option value="25">25 por página</option>
      </select>

      {isModalOpen && selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Usuario</h2>
            <input type="text" name="name" value={editData.name} onChange={handleInputChange} />
            <input type="email" name="email" value={editData.email} onChange={handleInputChange} />
            <select name="role" value={editData.role} onChange={handleInputChange}>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
            <button onClick={handleUpdate}>Guardar Cambios</button>
            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
