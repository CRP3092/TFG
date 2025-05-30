import express from "express";
import db from "../config/db.js"; // Importa la configuración de la base de datos

const router = express.Router(); // Crea una instancia de router para gestionar las rutas

// 🔍 Obtener perfil de usuario por ID
router.get("/usuario/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Obtiene el ID de usuario desde la URL
    const [userRows] = await db.query("SELECT * FROM users WHERE Id_User = ?", [userId]); // Consulta el perfil en la base de datos

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" }); // Devuelve un error si el usuario no existe
    }

    res.json(userRows[0]); // Envía la información del usuario en la respuesta
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" }); // Manejo de errores en la consulta de usuario
  }
});

// 🔄 Actualización de favoritos (Usando clave compuesta: "m1" o "s1")
router.put("/usuario/favorites", async (req, res) => {
  try {
    const { userId, itemKey, isFavorite } = req.body; // Extrae los datos enviados en el cuerpo de la petición

    const [userRows] = await db.query("SELECT Favorites FROM users WHERE Id_User = ?", [userId]); // Consulta los favoritos actuales del usuario
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" }); // Verifica que el usuario exista
    }
    
    let favoritesStr = userRows[0].Favorites || ""; // Obtiene la lista de favoritos como cadena
    let favoritesArray = favoritesStr
      ? favoritesStr.split(",").map(fav => fav.trim()).filter(fav => fav !== "") // Convierte la cadena en arreglo eliminando espacios vacíos
      : [];
    
    if (isFavorite) {
      if (!favoritesArray.includes(String(itemKey))) {
        favoritesArray.push(String(itemKey)); // Agrega el contenido a favoritos si no existe
      }
    } else {
      favoritesArray = favoritesArray.filter(fav => fav !== String(itemKey)); // Elimina el contenido de favoritos si ya existe
    }
    
    const updatedFavorites = favoritesArray.join(","); // Convierte el arreglo actualizado en cadena
    
    await db.query("UPDATE users SET Favorites = ? WHERE Id_User = ?", [updatedFavorites, userId]); // Guarda la actualización en la base de datos
    
    res.json({ Favorites: updatedFavorites }); // Retorna la lista actualizada de favoritos
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" }); // Maneja errores durante la actualización de favoritos
  }
});

// 🔄 Edición del perfil del usuario
router.put("/usuario/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Obtiene el ID de usuario desde la URL
    const { Name, Email, Address, avatar } = req.body; // Extrae los datos que pueden ser actualizados

    // Actualiza la información del usuario en la base de datos
    const [result] = await db.query(
      "UPDATE users SET Name = ?, Email = ?, Address = ?, avatar = ? WHERE Id_User = ?",
      [Name, Email, Address, avatar, userId]
    );

    // Si no se actualizó ninguna fila, probablemente el usuario no exista
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Consulta el usuario actualizado para enviarlo en la respuesta
    const [rows] = await db.query("SELECT * FROM users WHERE Id_User = ?", [userId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado después de la actualización" });
    }

    res.json(rows[0]); // Retorna la información actualizada del usuario
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor al actualizar el perfil" }); // Maneja errores en la actualización del perfil
  }
});

export default router; // Exporta las rutas definidas para ser utilizadas en el servidor principal
