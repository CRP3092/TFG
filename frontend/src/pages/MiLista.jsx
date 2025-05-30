import { useEffect, useState } from "react";
import config from "../utils/config";
import "../styles/styles.css";
import Modal from "../components/Modal";

/**
 * Componente MiLista
 * - Muestra las películas y series favoritas del usuario.
 * - Obtiene la lista completa de películas y series del backend.
 * - Filtra los favoritos del usuario a partir de `sessionStorage`.
 */
const MiLista = ({ setFavoriteMessage }) => {
  const [favMovies, setFavMovies] = useState([]); // Estado para almacenar películas favoritas
  const [favSeries, setFavSeries] = useState([]); // Estado para almacenar series favoritas
  const [moviesList, setMoviesList] = useState([]); // Lista completa de películas
  const [seriesList, setSeriesList] = useState([]); // Lista completa de series
  const [selectedItem, setSelectedItem] = useState(null); // Estado para el contenido seleccionado en el modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar modal

  // Cargar la lista completa de películas y series desde el backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/movies`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setMoviesList(data);
      } catch (error) {
        console.error("Error al cargar películas:", error);
      }
    };

    const fetchSeries = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/series`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setSeriesList(data);
      } catch (error) {
        console.error("Error al cargar series:", error);
      }
    };

    fetchMovies();
    fetchSeries();
  }, []);

  // Filtrar los favoritos del usuario a partir de `sessionStorage`
  const filterFavorites = () => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const favorites = user.Favorites
        ? user.Favorites.split(",").map(fav => fav.trim()).filter(fav => fav && fav !== "undefined")
        : [];
      setFavMovies(moviesList.filter(movie => favorites.includes(String(movie.Id_Movie))));
      setFavSeries(seriesList.filter(series => favorites.includes(String(series.Id_Series))));
    }
  };

  // Ejecutar filtrado cuando se carguen películas o series
  useEffect(() => {
    filterFavorites();
  }, [moviesList, seriesList]);

  // Escuchar el evento "favoritesUpdated" para refrescar la lista de favoritos
  useEffect(() => {
    const handleFavoritesUpdated = () => {
      filterFavorites();
    };
    window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
    return () => window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
  }, [moviesList, seriesList]);

  // Maneja la apertura del modal con los detalles del contenido seleccionado
  const handleClick = async (id, type) => {
    try {
      const response = await fetch(`${config.API_URL}/api/${type}/${id}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setSelectedItem({ ...data, type });
      setIsModalOpen(true);
    } catch (error) {
      console.error(`Error al cargar ${type}:`, error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="content-page">
      <h1>Mi Lista</h1>

      <div className="favorites-section">
        <h2>Películas Favoritas</h2>
        <div className="content-carousel">
          {favMovies.length > 0 ? (
            favMovies.map(movie => (
              <div key={movie.Id_Movie} className="content-card" onClick={() => handleClick(movie.Id_Movie, "movies")}>
                <div className="card-image-container">
                  <img src={`${config.API_URL}${movie.Image}`} alt={movie.Title} />
                </div>
                <p>{movie.Title}</p>
              </div>
            ))
          ) : (
            <p>No tienes películas en tu lista.</p>
          )}
        </div>
      </div>

      <div className="favorites-section">
        <h2>Series Favoritas</h2>
        <div className="content-carousel">
          {favSeries.length > 0 ? (
            favSeries.map(series => (
              <div key={series.Id_Series} className="content-card" onClick={() => handleClick(series.Id_Series, "series")}>
                <div className="card-image-container">
                  <img src={`${config.API_URL}${series.Image}`} alt={series.Title} />
                </div>
                <p>{series.Title}</p>
              </div>
            ))
          ) : (
            <p>No tienes series en tu lista.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} data={selectedItem} setFavoriteMessage={setFavoriteMessage} />
    </div>
  );
};

export default MiLista;
