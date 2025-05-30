import React, { useState, useEffect } from "react";
import config from "../utils/config";
import "../styles/styles.css";
import Modal from "../components/Modal";
import "font-awesome/css/font-awesome.min.css";
import { updateFavorites } from "../utils/favorites";

const Index = ({ setFavoriteMessage }) => {
  const [moviesList, setMoviesList] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Al montar, normalizamos el usuario para que siempre tenga Favorites definido
  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Si no existe o es "undefined", se fuerza una cadena vacía
      if (!user.Favorites || user.Favorites === "undefined") {
        user.Favorites = "";
        sessionStorage.setItem("user", JSON.stringify(user));
      }
    }
  }, []);

  // Fetch de películas y series
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/movies`);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setMoviesList(data);
      } catch (error) {
        console.error("❌ Error al cargar películas:", error);
      }
    };

    const fetchSeries = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/series`);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setSeriesList(data);
      } catch (error) {
        console.error("❌ Error al cargar series:", error);
      }
    };

    fetchMovies();
    fetchSeries();
  }, []);

  // Función para mostrar el modal con detalles
  const handleClick = async (id, type) => {
    try {
      const response = await fetch(`${config.API_URL}/api/${type}/${id}`);
      const data = await response.json();
      setSelectedItem({ ...data, type });
      setIsModalOpen(true);
    } catch (error) {
      console.error(`❌ Error al cargar ${type}:`, error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Subcomponente para cada tarjeta (película o serie)
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
        // Normalizamos Favorites a una cadena y removemos espacios o valores vacíos
        const favs = (user.Favorites || "")
          .split(",")
          .map(fav => fav.trim())
          .filter(fav => fav !== "");
        console.log("Actualizando estado para", favoriteKey, favs);
        setIsFavorite(favs.includes(favoriteKey));
      }
    };

    // Al montar o al cambiar favoriteKey, se actualiza el estado
    useEffect(() => {
      updateFavoriteState();
    }, [favoriteKey]);

    // Escucha del evento global "favoritesUpdated" para refrescar el estado
    useEffect(() => {
      window.addEventListener("favoritesUpdated", updateFavoriteState);
      return () => {
        window.removeEventListener("favoritesUpdated", updateFavoriteState);
      };
    }, [favoriteKey]);

    const handleFavoriteClick = async (e) => {
      e.stopPropagation();
      const newFavState = !isFavorite;
      // Actualización optimista del estado
      setIsFavorite(newFavState);
      setFavoriteMessage(newFavState ? "Añadido a favoritos" : "Eliminado de favoritos");
      setTimeout(() => setFavoriteMessage(""), 2000);
      setMessage(newFavState ? "Añadido a favoritos" : "Eliminado de favoritos");
      setTimeout(() => setMessage(""), 2000);

      // Llama a la función utilitaria para actualizar favoritos
      const success = await updateFavorites(favoriteKey, newFavState);
      if (!success) {
        console.error("❌ Error actualizando favoritos.");
      }
      // La función updateFavorites actualiza sessionStorage y dispara "favoritesUpdated"
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
    <div className="index-container">
      <h1>Bienvenido a Blockbuster</h1>
      <p>Explora nuestras series y películas.</p>

      <div className="content-section">
        <h2>Series Populares</h2>
        <div className="content-carousel">
          {seriesList.map((series) => (
            <ContentCard key={series.Id_Series} item={series} type="series" />
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>Películas Destacadas</h2>
        <div className="content-carousel">
          {moviesList.map((movie) => (
            <ContentCard key={movie.Id_Movie} item={movie} type="movies" />
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={selectedItem}
        setFavoriteMessage={setFavoriteMessage}
      />
    </div>
  );
};

export default Index;
