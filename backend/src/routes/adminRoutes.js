import express from "express"; // Importa Express para la gestión de rutas
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js"; // Middleware para autenticar usuarios y verificar si son administradores
import { getUsers, deleteUser, updateUser, addMovie, addSeries, getMovies, getSeries, getGenres } from "../controllers/adminController.js"; // Importa funciones de administración
import { deleteMovie, deleteSeries, updateMovie, updateSeries } from "../controllers/adminController.js"; // Importa funciones para modificar contenido

const router = express.Router(); // Crea una instancia de router para definir rutas

// 🔹 Ruta de acceso al panel de administración, solo accesible para administradores autenticados
router.get("/dashboard", authenticateToken, isAdmin, (req, res) => {
    res.json({ message: "Bienvenido al panel de administración." }); // Devuelve un mensaje de bienvenida al administrador
});

// 🔹 Rutas de gestión de usuarios
router.get("/users", authenticateToken, isAdmin, getUsers); // Obtiene la lista de usuarios
router.put("/users/:id", authenticateToken, isAdmin, updateUser); // Permite actualizar la información de un usuario
router.delete("/users/:id", authenticateToken, isAdmin, deleteUser); // Elimina un usuario de la base de datos

// 🔹 Rutas para gestionar películas y series
router.get("/movies", authenticateToken, isAdmin, getMovies); // Obtiene la lista de películas
router.get("/series", authenticateToken, isAdmin, getSeries); // Obtiene la lista de series
router.post("/movies", authenticateToken, isAdmin, addMovie); // Permite agregar una nueva película
router.put("/movies/:id", authenticateToken, isAdmin, updateMovie); // Actualiza la información de una película
router.delete("/movies/:id", authenticateToken, isAdmin, deleteMovie); // Elimina una película
router.post("/series", authenticateToken, isAdmin, addSeries); // Permite agregar una nueva serie
router.put("/series/:id", authenticateToken, isAdmin, updateSeries); // Actualiza la información de una serie
router.delete("/series/:id", authenticateToken, isAdmin, deleteSeries); // Elimina una serie

// 🔹 Nueva ruta para obtener géneros de contenido
router.get("/genres", authenticateToken, isAdmin, getGenres); // Obtiene la lista de géneros disponibles

export default router; // Exporta el router para ser utilizado en otras partes del servidor
