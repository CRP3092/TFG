import express from "express"; // Importa Express para gestionar rutas HTTP
import { loginUser } from "../controllers/loginController.js"; // Importa la función que maneja el inicio de sesión

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Endpoint para iniciar sesión
router.post("/", loginUser); // Maneja el proceso de autenticación cuando un usuario envía credenciales

export default router; // Exporta el router para su uso en otras partes del servidor
