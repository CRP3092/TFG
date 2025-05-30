import express from "express"; // Importa Express para gestionar las rutas
import db from "../config/db.js"; // Importa la configuración de la base de datos

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Obtener todas las películas desde la base de datos
router.get("/", async (req, res) => {
  try {
    // Ejecuta la consulta SQL para obtener todas las películas y sus detalles
    const [movies] = await db.query(
      "SELECT Id_Movie, Title, Genre, Release_Year, Duration, Synopsis, Language, Image FROM movies"
    );

    res.json(movies); // Envía la lista de películas en formato JSON
  } catch (error) {
    console.error("Error al obtener películas:", error); // Registra errores en la consola para depuración
    res.status(500).json({ message: "Error interno del servidor." }); // Envía un mensaje de error al cliente
  }
});

// 🔹 Obtener detalles de una película específica por su ID
router.get("/:id", async (req, res) => {
  try {
    // Ejecuta la consulta SQL para obtener la película con el ID especificado
    const [movie] = await db.query(
      "SELECT Id_Movie, Title, Genre, Release_Year, Duration, Synopsis, Language, Image FROM movies WHERE Id_Movie = ?",
      [req.params.id] // Obtiene el ID de la película desde la URL
    );

    // Si la película no se encuentra, devuelve un error 404
    if (!movie || movie.length === 0) {
      return res.status(404).json({ message: "Película no encontrada." });
    }

    res.json(movie[0]); // Retorna la película encontrada en formato JSON
  } catch (error) {
    console.error("Error al obtener película:", error); // Registra errores en la consola para depuración
    res.status(500).json({ message: "Error interno del servidor." }); // Envía un mensaje de error al cliente
  }
});

export default router; // Exporta el router para su uso en otras partes del servidor
