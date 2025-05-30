import React, { useState } from "react";
import config from "../utils/config";
import "./Card.css"; // Asegúrate de crear este archivo o agregar el CSS en tu proyecto

const Card = ({ item, isFavoriteInitial = false, onFavoriteToggle }) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [message, setMessage] = useState("");

  const handleFavoriteClick = async () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // Mostrar el mensaje emergente
    if (newFavoriteState) {
      setMessage("Añadido a favoritos");
    } else {
      setMessage("Eliminado de favoritos");
    }
    setTimeout(() => setMessage(""), 2000);

    // Actualizar la base de datos mediante API
    try {
      // Se asume que la información del usuario se guarda en sessionStorage
      const user = JSON.parse(sessionStorage.getItem("user"));
      
      // Asegurarse de que el avatar del usuario no se sobrescriba
      const response = await fetch(`${config.API_URL}/api/usuario/favorites`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // ID del usuario
          itemId: item.id, // ID de la película/serie
          isFavorite: newFavoriteState,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar favoritos");
      }

      const data = await response.json();

      // Guardar los datos actualizados en sessionStorage sin modificar el avatar
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          favorites: data.Favorites, // Se actualizan solo los favoritos
        })
      );

      // Opcional: consumir el callback para notificar al padre
      if (onFavoriteToggle) onFavoriteToggle(item.id, newFavoriteState);
    } catch (error) {
      console.error("Error actualizando favoritos:", error);
    }
  };

  return (
    <div className="card">
      <div className="card-image">
        <img
          src={`${config.API_URL}/path/to/images/${item.image}`}
          alt={item.title}
        />
        <div className="favorite-icon" onClick={handleFavoriteClick}>
          <i className={`fa ${isFavorite ? "fa-star" : "fa-star-o"}`} />
        </div>
        {message && <div className="favorite-message">{message}</div>}
      </div>
      <div className="card-content">
        <h3>{item.title}</h3>
      </div>
    </div>
  );
};

export default Card;
