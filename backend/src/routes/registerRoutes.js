import express from "express"; // Importa Express para definir rutas
import { registerUser } from "../controllers/registerController.js"; // Importa la función que maneja el registro de usuarios

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Endpoint para registrar un nuevo usuario
router.post("/", async (req, res) => {
    try {
        const newUser = await registerUser(req.body); // Llama a la función que crea un usuario con los datos enviados en el cuerpo de la petición
        res.status(201).json({ message: "Usuario registrado correctamente", user: newUser }); // Devuelve respuesta con el nuevo usuario creado
    } catch (error) {
        console.error("Error en registro:", error); // Registra el error en consola para facilitar la depuración
        res.status(500).json({ message: "Error interno al registrar usuario." }); // Envía una respuesta de error en caso de fallo
    }
});

export default router; // Exporta el router para ser utilizado en la configuración del servidor
