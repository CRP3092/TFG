import express from "express"; // Importa Express para gestionar rutas HTTP
import { getAvatars } from "../controllers/userController.js"; // Importa la función que obtiene la lista de avatares disponibles

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Endpoint para obtener la lista de avatares disponibles
router.get("/", getAvatars); // Llama al controlador para obtener los avatares y enviarlos como respuesta

export default router; // Exporta el router para ser utilizado en otras partes del servidor
