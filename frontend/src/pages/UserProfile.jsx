import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from "../utils/config";
import "../styles/userProfile.css";
import Modal from "../components/Modal";

const UserProfile = () => {
  const { id: paramId } = useParams();

  // Obtiene el ID de usuario desde la URL o sessionStorage
  const getUserId = () => {
    if (paramId) return paramId;
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.id || user.Id_User || null;
  };

  const [userData, setUserData] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRatings, setUserRatings] = useState([]);

  const planMapping = {
    1: "Mensual",
    2: "Trimestral",
    3: "Anual",
  };

  // Obtiene el perfil del usuario
  const fetchUserProfile = async () => {
    const userId = getUserId();
    if (!userId) {
      console.error("❌ No se encontró un ID de usuario válido.");
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/usuario/${userId}`);
      if (!response.ok) {
        console.error("Respuesta no OK, status:", response.status);
        return;
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("❌ Error al cargar perfil de usuario:", error);
    }
  };

  // Obtiene todas las calificaciones realizadas por el usuario
  const fetchUserRatings = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`${config.API_URL}/api/usuario/${userId}/ratings`);
      if (response.ok) {
        const ratingsData = await response.json();
        setUserRatings(ratingsData);
      }
    } catch (error) {
      console.error("❌ Error obteniendo calificaciones del usuario:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserRatings();
  }, [paramId]);

  useEffect(() => {
    const handleFavoritesUpdate = () => {
      console.log("【UserProfile】Evento 'favoritesUpdated' recibido");
      fetchUserProfile();
    };
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [paramId]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userData || !userData.Favorites) return;
      const favIds = userData.Favorites.split(",").map((fav) => fav.trim()).filter((fav) => fav !== "" && fav !== "undefined");

      const favPromises = favIds.map(async (favId) => {
        let item = null;
        try {
          const resMovie = await fetch(`${config.API_URL}/api/movies/${favId}`);
          if (resMovie.ok) {
            const dataMovie = await resMovie.json();
            item = { ...dataMovie, type: "movie" };
          }
        } catch (e) {
          console.error("❌ Error al cargar favorito (movie)", favId, e);
        }

        if (!item) {
          try {
            const resSeries = await fetch(`${config.API_URL}/api/series/${favId}`);
            if (resSeries.ok) {
              const dataSeries = await resSeries.json();
              item = { ...dataSeries, type: "series" };
            }
          } catch (e) {
            console.error("❌ Error al cargar favorito (series)", favId, e);
          }
        }

        return item;
      });

      const favResults = await Promise.all(favPromises);
      setFavoriteItems(favResults.filter((item) => item !== null).sort((a, b) => (a.Title || "").localeCompare(b.Title || "")));
    };

    fetchFavorites();
  }, [userData]);

  const handleFavoriteItemClick = async (favId, type) => {
    try {
      const endpoint = type === "movie" ? "movies" : "series";
      const response = await fetch(`${config.API_URL}/api/${endpoint}/${favId}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setSelectedItem({ ...data, type });
      setIsModalOpen(true);
    } catch (error) {
      console.error(`❌ Error al cargar detalle de ${type} con ID ${favId}:`, error);
    }
  };

  if (!userData) {
    return <p className="loading">Cargando perfil...</p>;
  }

  const avatarValue = userData.Avatar && typeof userData.Avatar === "string" ? userData.Avatar : "";
  const avatarSrc = avatarValue && avatarValue !== "undefined" ? (avatarValue.startsWith("http") ? avatarValue : `${config.API_URL}${avatarValue}`) : `${config.API_URL}/uploads/avatars/7309681.jpg`;

  return (
    <div className="userProfile-container">
      <div className="userProfile-header">
        <img className="avatar" src={avatarSrc} alt="Avatar" />
        <h2>{userData.Name}</h2>
        <p>{userData.Email}</p>
      </div>

      <div className="userProfile-main">
        <div className="userProfile-section userProfile-details">
          <h3>Detalles</h3>
          <p><strong>Fecha de registro: 24 - 04 - 2025 </strong></p>
          <p><strong>Dirección:</strong> {userData.Address}</p>
        </div>

        <div className="userProfile-section userProfile-subscription">
          <h3>Suscripción</h3>
          <p>{userData.id_subscription ? planMapping[userData.id_subscription] || "Sin suscripción" : "Sin suscripción"}</p>
        </div>
      </div>

      <div className="userProfile-grid">
        <div className="userProfile-section userProfile-favorites">
          <h3>Favoritos</h3>
          <div className="favorites-gallery">
            {favoriteItems.length > 0 ? favoriteItems.map((fav, index) => (
              <div key={index} className="favorite-item" onClick={() => handleFavoriteItemClick(fav.Id_Movie || fav.Id_Series, fav.type)} style={{ cursor: "pointer" }}>
                <img src={`${config.API_URL}${fav.Image}`} alt={fav.Title || "Favorito"} className="favorite-image" />
                <p>{fav.Title}</p>
              </div>
            )) : <p>No tienes favoritos.</p>}
          </div>
        </div>

        <div className="userProfile-section userProfile-ratings">
          <h3>Tus Puntuaciones</h3>
          {userRatings.length === 0 ? <p>No has realizado ninguna valoración</p> : <ul className="ratings-list">{userRatings.map((rating) => (<li key={rating.item_key}><span>Contenido: {rating.item_key} - Puntuación: {rating.rating}</span></li>))}</ul>}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedItem(null); }} data={selectedItem} />
    </div>
  );
};

export default UserProfile;
