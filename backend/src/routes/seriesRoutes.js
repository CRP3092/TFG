import express from "express";
import db from "../config/db.js"; // Importa la configuración de la base de datos

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Obtener todas las series desde la base de datos
router.get("/", async (req, res) => {
  try {
    const [series] = await db.query(
      "SELECT Id_Series, Title, Genre, Release_Year, Duration, Synopsis, Seasons, Language, Image FROM series"
    ); // Ejecuta la consulta para obtener la lista de series

    res.json(series); // Envía la lista de series como respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener series:", error); // Muestra errores en consola para depuración
    res.status(500).json({ message: "Error interno del servidor." }); // Devuelve un mensaje de error al cliente
  }
});

// 🔹 Obtener detalles de una serie específica por su ID
router.get("/:id", async (req, res) => {
  try {
    const [series] = await db.query(
      "SELECT Id_Series, Title, Genre, Release_Year, Duration, Synopsis, Seasons, Language, Image FROM series WHERE Id_Series = ?",
      [req.params.id] // Utiliza el ID recibido en la URL para filtrar la consulta
    );

    if (!series || series.length === 0) {
      return res.status(404).json({ message: "Serie no encontrada." }); // Si la serie no existe, devuelve un error 404
    }

    res.json(series[0]); // Retorna la serie encontrada en formato JSON
  } catch (error) {
    console.error("Error al obtener serie:", error); // Registra errores en consola para depuración
    res.status(500).json({ message: "Error interno del servidor." }); // Devuelve un mensaje de error al cliente
  }
});

export default router; // Exporta el router para ser utilizado en otras partes del servidor
