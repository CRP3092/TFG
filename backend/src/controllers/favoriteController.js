import db from "../config/db.js"; // Importa la configuración de conexión a la base de datos

/**
 * Controlador para actualizar la lista de favoritos de un usuario.
 * Se espera recibir en el cuerpo de la petición:
 *  - userId: ID del usuario que realiza la acción.
 *  - itemKey: Identificador del contenido que se agrega o elimina de favoritos.
 *  - isFavorite: Booleano que indica si se debe agregar (true) o eliminar (false).
 */
export const updateFavoritesController = async (req, res) => {
  const { userId, itemKey, isFavorite } = req.body; // Extrae los datos enviados en la solicitud

  // Validar que todos los datos requeridos estén presentes y sean correctos
  if (!userId || !itemKey || typeof isFavorite !== "boolean") {
    return res.status(400).json({ error: "Faltan datos obligatorios o el valor de isFavorite es inválido." });
  }

  try {
    // Consultar la lista de favoritos del usuario en la base de datos
    const [rows] = await db.query("SELECT Favorites FROM users WHERE Id_User = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    let currentFavs = rows[0].Favorites || ""; // Obtiene la lista de favoritos como cadena

    // Convertir la lista de favoritos en un array para manipulación
    let favArray = currentFavs.trim() === "" ? [] : currentFavs.split(",").map(fav => fav.trim());

    if (isFavorite) {
      // Agregar el contenido a favoritos si no existe
      if (!favArray.includes(String(itemKey))) {
        favArray.push(String(itemKey));
      }
    } else {
      // Eliminar el contenido de favoritos si ya existe
      favArray = favArray.filter(fav => fav !== String(itemKey));
    }

    const newFavs = favArray.join(","); // Convierte la lista actualizada en una cadena separada por comas

    // Actualizar la lista de favoritos en la base de datos
    await db.query("UPDATE users SET Favorites = ? WHERE Id_User = ?", [newFavs, userId]);

    return res.status(200).json({ Favorites: newFavs }); // Retorna la lista de favoritos actualizada
  } catch (error) {
    console.error("Error en updateFavoritesController:", error); // Registra el error en consola
    return res.status(500).json({ error: "Error interno del servidor" }); // Devuelve un mensaje de error al cliente
  }
};
