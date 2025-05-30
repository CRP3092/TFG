import React, { useState, useEffect } from "react";
import "../styles/modal.css"; // Importa los estilos del modal
import config from "../utils/config"; // Importa configuración del backend
import { updateFavorites } from "../utils/favorites"; // Asegúrate de la ruta correcta

/**
 * Componente Modal
 * - Muestra la información detallada de un contenido (película o serie).
 * - Permite añadir o eliminar el contenido de favoritos.
 * - Gestiona la puntuación del usuario y muestra la valoración promedio.
 */
const Modal = ({ isOpen, onClose, data, setFavoriteMessage }) => {
  const [isFavorite, setIsFavorite] = useState(false); // Estado para gestionar favoritos
  const [userRating, setUserRating] = useState(null); // Estado para la calificación del usuario
  const [aggregatedRating, setAggregatedRating] = useState(null); // Estado para la calificación promedio
  const [ratingMessage, setRatingMessage] = useState(""); // Estado para el mensaje de calificación

  // Obtiene el identificador correcto según el tipo de contenido
  const getFavoriteId = () => {
    if (!data) return null;
    const normalizedType = data.type ? data.type.toLowerCase() : "";
    return normalizedType === "movie" || normalizedType === "movies"
      ? data.Id_Movie
      : data.Id_Series;
  };

  useEffect(() => {
    if (data) {
      const favoriteId = getFavoriteId();
      const userStr = sessionStorage.getItem("user");

      if (userStr) {
        const user = JSON.parse(userStr);
        const favs = (user.Favorites || "")
          .split(",")
          .map(fav => fav.trim())
          .filter(fav => fav !== "");
        setIsFavorite(favs.includes(String(favoriteId)));
      }

      fetchUserRating();
      fetchAggregatedRating();
      setUserRating(null); // Reinicia el estado de calificación al cambiar de Card
      setRatingMessage(""); // Limpia cualquier mensaje previo
    }
  }, [data]);

  // Obtiene la puntuación promedio del contenido
  const fetchAggregatedRating = async () => {
    if (!data) return;
    const itemKey = getFavoriteId();

    try {
      const response = await fetch(`${config.API_URL}/api/contenido/${itemKey}/ratings`);
      if (response.ok) {
        const ratingData = await response.json();
        setAggregatedRating(ratingData.averageRating);
      }
    } catch (error) {
      console.error("Error obteniendo puntuación promedio:", error);
    }
  };

  // Obtiene la calificación del usuario
  const fetchUserRating = async () => {
    if (!data) return;
    const itemKey = getFavoriteId();
    const userObj = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userId = userObj.id || userObj.Id_User;

    try {
      const response = await fetch(`${config.API_URL}/api/usuario/${userId}/ratings`);
      if (response.ok) {
        const ratingsData = await response.json();
        const userRatingEntry = ratingsData.find(r => r.item_key === String(itemKey));

        if (userRatingEntry) {
          setUserRating(userRatingEntry.rating);
        } else {
          setUserRating(null);
        }
      }
    } catch (error) {
      console.error("Error obteniendo la calificación del usuario:", error);
    }
  };

  // Maneja la selección de calificación
  const handleRateSelect = async (value) => {
    setUserRating(value);
    const itemKey = getFavoriteId();
    const userObj = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userId = userObj.id || userObj.Id_User;
    const requestBody = { userId, itemKey: String(itemKey), rating: value };

    try {
      const response = await fetch(`${config.API_URL}/api/usuario/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error actualizando rating (Código: ${response.status})`);
      }

      setRatingMessage("✅ Calificación guardada correctamente.");
      setTimeout(() => setRatingMessage(""), 2000);
      fetchAggregatedRating();
    } catch (error) {
      console.error("❌ Error actualizando rating desde el modal:", error);
    }
  };

  // Maneja favoritos
  const handleFavoriteClick = async () => {
    if (!data) return;
    const favoriteId = getFavoriteId();
    const newFavState = !isFavorite;
    setIsFavorite(newFavState);

    if (typeof setFavoriteMessage === "function") {
      setFavoriteMessage(newFavState ? "Añadido a favoritos" : "Eliminado de favoritos");
      setTimeout(() => setFavoriteMessage(""), 2000);
    }

    await updateFavorites(favoriteId, newFavState);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{data?.Title}</h2>

        {/* Botón de Favoritos */}
        <div className="modal-favorite">
          <button onClick={handleFavoriteClick}>
            {isFavorite ? "Eliminar de Favoritos" : "Añadir a Favoritos"}
          </button>
        </div>
      {/*
        {/* Sección de rating */}
        <div className="modal-rating">
          <h3>Califica este contenido</h3>
          <div className="rating-buttons">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <button
                key={value}
                onClick={() => handleRateSelect(value)}
                className={`rating-button ${userRating === value ? "selected" : ""}`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="rating-display">
            <span>Tu puntuación: {userRating !== null ? userRating : "No seleccionada"}</span>
          </div>
          {ratingMessage && <p className="rating-message">{ratingMessage}</p>}
          {aggregatedRating != null && !isNaN(aggregatedRating) ? (
            <p className="aggregated-rating">Puntuación promedio: {Number(aggregatedRating).toFixed(1)}</p>
          ) : (
            <p className="aggregated-rating">Puntuación promedio: 0.0</p>
          )}
          {/* Botón para guardar la calificación */}
          <button className="confirm-rating-button" onClick={() => handleRateSelect(userRating)}>
            Guardar Calificación
          </button>
        </div>

        {/* Imagen y detalles del contenido */}
        <img className="modal-image" src={`${config.API_URL}${data?.Image}`} alt={data?.Title} />
        <p><strong>Año de lanzamiento:</strong> {data?.Release_Year}</p>
        <p><strong>Sinopsis:</strong> {data?.Synopsis}</p>
      </div>
    </div>
  );
};

export default Modal;
