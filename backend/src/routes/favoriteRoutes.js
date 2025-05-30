import express from "express"; // Importa Express para manejar las rutas HTTP
import { updateFavoritesController } from "../controllers/favoriteController.js"; // Importa el controlador que actualiza la lista de favoritos

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Endpoint para actualizar la lista de favoritos de un usuario
router.put("/", updateFavoritesController); // Llama al controlador para modificar los favoritos

export default router; // Exporta el router para ser utilizado en otras partes del servidor
