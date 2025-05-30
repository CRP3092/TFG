import express from "express"; // Importa Express para la gestión de rutas
import db from "../config/db.js"; // Importa la configuración de la base de datos
import { authenticateToken } from "../middlewares/authMiddleware.js"; // Middleware para autenticar la sesión del usuario

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Endpoint para obtener el perfil de un usuario autenticado
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Consulta los datos del usuario en la base de datos usando su ID
    const [userRows] = await db.query(
      "SELECT Id_User, Name, Email, Avatar FROM users WHERE Id_User = ?",
      [req.user.userId]
    );

    // Si no se encuentra el usuario, se devuelve un error 404
    if (userRows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(userRows[0]); // Envía la información del usuario en formato JSON
  } catch (error) {
    console.error("Error en perfil:", error); // Registra el error en consola para facilitar la depuración
    res.status(500).json({ message: "Error interno en el servidor." }); // Envía una respuesta de error en caso de fallo
  }
});

export default router; // Exporta el router para ser utilizado en otras partes del servidor
