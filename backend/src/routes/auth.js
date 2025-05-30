import express from "express"; // Importa Express para gestionar rutas HTTP
import { register, login } from "../controllers/userController.js"; // Importa los controladores de registro e inicio de sesión
import { authenticateToken } from "../middlewares/authMiddleware.js"; // Middleware para autenticar sesiones
import { logout, resetPasswordRequest, verifyEmail } from "../controllers/authController.js"; // Importa controladores para autenticación adicional

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Rutas de autenticación de usuarios
router.post("/register", register); // Endpoint para registrar nuevos usuarios
router.post("/login", login); // Endpoint para iniciar sesión

// 🔹 Ruta protegida: Obtiene el perfil del usuario autenticado
router.get("/perfil", authenticateToken, async (req, res) => {
    try {
        // Consulta la base de datos para obtener información del usuario por ID
        const [userRows] = await db.query("SELECT Id_User, Name, Email, Avatar FROM USER WHERE Id_User = ?", [req.user.userId]);

        // Si el usuario no existe, devuelve un error 404
        if (userRows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.status(200).json(userRows[0]); // Retorna la información del usuario en formato JSON
    } catch (error) {
        console.error("Error en perfil:", error); // Registra errores en consola para depuración
        res.status(500).json({ message: "Error interno en el servidor." }); // Envía un mensaje de error al cliente
    }
});

// 🔹 Otras rutas de autenticación
router.post("/logout", logout); // Endpoint para cerrar sesión
router.post("/reset-password", resetPasswordRequest); // Endpoint para solicitud de restablecimiento de contraseña
router.post("/verify-email", verifyEmail); // Endpoint para verificación de correo electrónico

export default router; // Exporta el router para ser utilizado en otras partes del servidor
