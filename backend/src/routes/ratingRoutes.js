import express from "express"; // Importa Express para la gestión de rutas
import {
  saveOrUpdateRating, // Función para guardar o actualizar una valoración
  getContentRatings, // Función para obtener el promedio y total de votos de un contenido
  getUserRatingsController // Función para obtener todas las valoraciones de un usuario
} from "../controllers/ratingController.js";

const router = express.Router(); // Crea una instancia de router para manejar las rutas

// 🔹 Endpoint para guardar o actualizar una valoración de contenido
router.put("/usuario/rating", saveOrUpdateRating); // Actualiza la valoración del usuario sobre un contenido

// 🔹 Endpoint para obtener el promedio y total de votos de un contenido
// Se utiliza la estructura GET /api/contenido/:itemKey/ratings para consultar los ratings de un contenido específico
router.get("/:itemKey/ratings", getContentRatings);

// 🔹 Endpoint opcional para obtener todas las valoraciones realizadas por un usuario
router.get("/usuario/:userId/ratings", getUserRatingsController);

export default router; // Exporta el router para ser utilizado en otras partes del servidor
