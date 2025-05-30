import React, { useState, useEffect } from "react";
import config from "../utils/config";
import "../styles/styles.css";
import Modal from "../components/Modal";
import "font-awesome/css/font-awesome.min.css";
import { updateFavorites } from "../utils/favorites";

const Series = ({ setFavoriteMessage }) => {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar la lista de series desde la API
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/series`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSeriesList(data);
      } catch (error) {
        console.error("❌ Error al cargar las series:", error);
      }
    };
    fetchSeries();
  }, []);

  // Al hacer clic en la tarjeta (excepto el ícono de favorito), se abre el modal
  const handleClick = async (seriesId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/series/${seriesId}`);
      const data = await response.json();
      setSelectedSeries({ ...data, type: "series" });
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Error al cargar la serie:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeries(null);
  };

  // Subcomponente ContentCard para cada serie
  const ContentCard = ({ item, type }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [message, setMessage] = useState("");
    // Determinar favoriteKey según si es película o serie
    const favoriteKey = String(item.Id_Movie || item.Id_Series);

    // Función para actualizar el estado de favoritos leyendo sessionStorage
    const updateFavoriteState = () => {
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const favs = user.Favorites
          ? user.Favorites.split(",").map(fav => fav.trim())
          : [];
        setIsFavorite(favs.includes(favoriteKey));
      }
    };

    // Al montar o al cambiar favoriteKey, se actualiza el estado
    useEffect(() => {
      updateFavoriteState();
    }, [favoriteKey]);

    // Además, escucha el evento global "favoritesUpdated" para refrescar el estado
    useEffect(() => {
      window.addEventListener("favoritesUpdated", updateFavoriteState);
      return () => {
        window.removeEventListener("favoritesUpdated", updateFavoriteState);
      };
    }, [favoriteKey]);

    const handleFavoriteClick = async (e) => {
      e.stopPropagation();
      const newFavState = !isFavorite;
      setIsFavorite(newFavState);
      
      setFavoriteMessage(newFavState ? "Añadido a favoritos" : "Eliminado de favoritos");
      setTimeout(() => setFavoriteMessage(""), 2000);
      setMessage(newFavState ? "Añadido a favoritos" : "Eliminado de favoritos");
      setTimeout(() => setMessage(""), 2000);

      // Llamamos a la función utilitaria para actualizar favoritos
      // (Esta función se encuentra en utils/favorites.js)
      const success = await updateFavorites(favoriteKey, newFavState);
      if (!success) {
        console.error("❌ Error actualizando favoritos.");
      }
      // La función updateFavorites actualiza sessionStorage y dispara "favoritesUpdated"
      // así que aquí no es necesario volver a forzar el estado manualmente.
    };

    return (
      <div className="content-card" onClick={() => handleClick(favoriteKey, type)}>
        <div className="card-image-container" style={{ position: "relative" }}>
          <img src={`${config.API_URL}${item.Image}`} alt={item.Title} />
          <div
            className="favorite-icon"
            onClick={(e) => handleFavoriteClick(e)}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              cursor: "pointer",
            }}
          >
            <i
              className={`fa ${isFavorite ? "fa-star" : "fa-star-o"}`}
              style={{ fontSize: "24px", color: "gold" }}
            />
            {message && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "40px",
                  background: "rgba(0,0,0,0.7)",
                  padding: "3px 8px",
                  borderRadius: "5px",
                  color: "white",
                  fontSize: "14px",
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
        <p>{item.Title}</p>
      </div>
    );
  };

  return (
    <div className="content-page">
      <h1>Series</h1>
      <div className="content-carousel">
        {seriesList.map((serie) => (
          <ContentCard key={serie.Id_Series} item={serie} />
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={selectedSeries}
        setFavoriteMessage={setFavoriteMessage}
      />
    </div>
  );
};

export default Series;
