import express from "express"; // Importa Express para gestionar el servidor y las rutas
import dotenv from "dotenv"; // Importa dotenv para manejar variables de entorno
import cors from "cors"; // Habilita CORS para permitir solicitudes desde otros dominios
import path from "path"; // Importa path para manejar rutas de archivos
import registerRoutes from "./routes/registerRoutes.js"; // Importa las rutas de registro de usuarios
import loginRoutes from "./routes/loginRoutes.js"; // Importa las rutas de inicio de sesión
import adminRoutes from "./routes/adminRoutes.js"; // Importa las rutas de administración
import profileRoutes from "./routes/profileRoutes.js"; // Importa las rutas de perfil de usuario
import moviesRoutes from "./routes/moviesRoutes.js"; // Importa las rutas para obtener películas
import seriesRoutes from "./routes/seriesRoutes.js"; // Importa las rutas para obtener series
import ratingRoutes from "./routes/ratingRoutes.js"; // Importa las rutas de valoraciones
import favoriteRoutes from "./routes/favoriteRoutes.js"; // Importa las rutas para gestionar favoritos
import userRoutes from "./routes/userRoutes.js"; // Importa las rutas de usuario
import editProfileRoutes from "./routes/editProfileRoutes.js"; // Importa las rutas para la edición de perfil

dotenv.config(); // Carga las variables de entorno desde el archivo .env
const app = express(); // Crea una instancia de la aplicación Express

app.use(express.json()); // Configura Express para procesar solicitudes JSON
app.use(cors()); // Habilita CORS para permitir solicitudes externas

// 🔹 Rutas de autenticación y administración
app.use("/api/register", registerRoutes); // Maneja el registro de usuarios
app.use("/api/login", loginRoutes); // Maneja el inicio de sesión
app.use("/api/admin", adminRoutes); // Rutas relacionadas con la administración
app.use("/api/profile", profileRoutes); // Rutas relacionadas con perfiles de usuario

// 🔹 Montar rutas específicas primero
app.use("/api/movies", moviesRoutes); // Rutas de películas
app.use("/api/series", seriesRoutes); // Rutas de series
app.use("/api/usuario/favorites", favoriteRoutes); // Rutas de favoritos del usuario
app.use("/api/contenido", ratingRoutes); // Rutas de valoraciones de contenido

// 🔹 Luego, rutas generales (si es necesario)
app.use("/api", userRoutes); // Rutas de usuario generales
app.use("/api/edit-profile", editProfileRoutes); // Rutas para editar perfiles

// 🔹 Servir archivos estáticos
app.use("/uploads", express.static(path.resolve("public/uploads"))); // Permite acceder a archivos en la carpeta de cargas

// 🔹 Ruta de prueba para verificar que el servidor está corriendo
app.get("/", (req, res) => {
    res.send("Servidor backend corriendo..."); // Devuelve un mensaje para comprobar el estado del servidor
});

// 🔹 Manejo global de errores
app.use((err, req, res, next) => {
    console.error("Error interno:", err); // Registra el error en consola
    res.status(500).json({ message: "Error interno del servidor." }); // Envía un mensaje de error al cliente
});

// 🔹 Inicio del servidor en el puerto configurado
const PORT = process.env.PORT || 5000; // Obtiene el puerto desde las variables de entorno o usa el 5000 por defecto
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`); // Mensaje de confirmación del inicio del servidor
});
