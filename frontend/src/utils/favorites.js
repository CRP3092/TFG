import config from "./config";

// Función para actualizar los favoritos del usuario (agregar o quitar)
// favoriteId: identificador del contenido (película o serie)
// addFavorite: booleano indicando si se agrega (true) o se remueve (false)
export const updateFavorites = async (favoriteId, addFavorite) => {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) return false;

  const user = JSON.parse(userStr);

  // Aseguramos que la propiedad Favorites sea una cadena válida
  let userFavs = user.Favorites;
  if (!userFavs || userFavs === "undefined") {
    userFavs = "";
  }

  // Convertimos la cadena en un array (si no está vacía)
  let favs = [];
  if (userFavs.trim() !== "") {
    favs = userFavs.split(",").map(fav => fav.trim());
  }

  // Actualizamos el array según si se agrega o se retira el favorito
  if (addFavorite) {
    if (!favs.includes(String(favoriteId))) {
      favs.push(String(favoriteId));
    }
  } else {
    favs = favs.filter(fav => fav !== String(favoriteId));
  }

  // Actualizamos la propiedad Favorites y guardamos el usuario actualizado en sessionStorage
  user.Favorites = favs.join(",");
  sessionStorage.setItem("user", JSON.stringify(user));

  // Preparamos el objeto payload para notificar al backend
  const payload = {
    userId: user.id || user.Id_User, // Soporta ambos formatos
    itemKey: String(favoriteId),
    isFavorite: addFavorite,
  };

  try {
    const response = await fetch(`${config.API_URL}/api/usuario/favorites`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error actualizando favoritos (Código: ${response.status})`);
    }
    const backendData = await response.json();
    console.log("✅ Favoritos actualizados en el backend:", backendData);

    // Opcional: Actualizamos el usuario desde el backend para tener siempre datos correctos
    const updatedUserResponse = await fetch(
      `${config.API_URL}/api/usuario/${user.id || user.Id_User}`
    );
    if (updatedUserResponse.ok) {
      const updatedUserData = await updatedUserResponse.json();

      // Normalizamos el objeto usuario para que siempre tenga "id" en lugar de "Id_User"
      const normalizedUser = {
        id: updatedUserData.id || updatedUserData.Id_User,
        ...updatedUserData,
      };

      sessionStorage.setItem("user", JSON.stringify(normalizedUser));
      window.dispatchEvent(new CustomEvent("favoritesUpdated"));
    }
    return true;
  } catch (error) {
    console.error("❌ Error actualizando favoritos en el backend:", error);
    return false;
  }
};
