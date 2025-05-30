import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../utils/config";
import "../styles/editProfile.css";

/**
 * Componente EditProfile
 * - Permite a los usuarios actualizar su perfil (nombre, email, dirección y avatar).
 * - Recupera los datos desde `localStorage` y los envía al backend.
 */
const EditProfile = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    avatar: "",
  });
  const [originalUserData, setOriginalUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar datos del usuario desde `localStorage` y el backend
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userId = user.id || user.Id_User;
        try {
          const response = await fetch(
            `${config.API_URL}/api/edit-profile/${userId}`
          );
          if (!response.ok) {
            throw new Error("Error al obtener datos desde el servidor");
          }
          const data = await response.json();
          
          // Normalización de avatar: asigna uno por defecto si está vacío
          const fetchedData = {
            name: data.Name || "",
            email: data.Email || "",
            address: data.Address || "",
            avatar: data.avatar && data.avatar !== "" && data.avatar !== "undefined"
              ? data.avatar
              : `${config.API_URL}/uploads/avatars/default-avatar.jpg`,
          };

          setUserData(fetchedData);
          setOriginalUserData(fetchedData);
        } catch (error) {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("No se encontró usuario en almacenamiento.");
      }
    };
    loadUser();
  }, []);

  // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Activa el modo edición
  const handleEdit = (e) => {
    e.preventDefault();
    setEditMode(true);
  };

  // Cancela la edición y revierte los datos al estado original
  const handleCancel = (e) => {
    e.preventDefault();
    setEditMode(false);
    setUserData(originalUserData);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Envía los datos actualizados al backend y guarda en `localStorage`
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editMode) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setErrorMessage("No se encontró el usuario en almacenamiento.");
      setLoading(false);
      return;
    }
    const user = JSON.parse(storedUser);
    const userId = user.id || user.Id_User;

    const updatedProfile = {
      Name: userData.name,
      Email: userData.email,
      Address: userData.address,
      avatar: userData.avatar,
    };

    try {
      const response = await fetch(
        `${config.API_URL}/api/edit-profile/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        throw new Error(`Error actualizando perfil (Código: ${response.status})`);
      }

      const updatedUserData = await response.json();
      const normalizedUser = {
        id: updatedUserData.id || updatedUserData.Id_User,
        ...updatedUserData,
      };

      const newData = {
        name: normalizedUser.Name || "",
        email: normalizedUser.Email || "",
        address: normalizedUser.Address || "",
        avatar: normalizedUser.avatar || `${config.API_URL}/uploads/avatars/default-avatar.jpg`,
      };

      setOriginalUserData(newData);
      setUserData(newData);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setSuccessMessage("Perfil actualizado correctamente.");
      setEditMode(false);
      setLoading(false);

      setTimeout(() => {
        navigate(`/usuario/${normalizedUser.id}`);
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <label>
          Nombre:
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            disabled={!editMode}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            disabled={!editMode}
            required
          />
        </label>
        <label>
          Dirección:
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleChange}
            disabled={!editMode}
          />
        </label>
        {!editMode ? (
          <div className="action-buttons">
            <button type="button" onClick={handleEdit}>
              Editar
            </button>
          </div>
        ) : (
          <div className="action-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button type="button" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditProfile;
