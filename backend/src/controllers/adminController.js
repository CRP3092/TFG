import db from "../config/db.js"; // Importa la configuración de la base de datos

// 🔹 Obtener la lista de usuarios
export const getUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT Id_User AS id, Name AS name, Email AS email, role FROM users"
        );
        res.status(200).json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Actualizar información de un usuario
export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE users SET Name = ?, Email = ?, role = ? WHERE Id_User = ?",
            [name, email, role, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.json({ message: "Usuario actualizado correctamente." });
    } catch (error) {
        console.error("Error en actualización:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Eliminar un usuario
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM users WHERE Id_User = ?", [id]);
        res.status(200).json({ message: "Usuario eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario." });
    }
};

// 🔹 Obtener la lista de películas
export const getMovies = async (req, res) => {
    try {
        const [movies] = await db.query(
            "SELECT Id_Movie AS id, Title, Genre, Release_Year, Duration, Language FROM movies"
        );
        res.status(200).json(movies);
    } catch (error) {
        console.error("Error al obtener películas:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Obtener la lista de series
export const getSeries = async (req, res) => {
    try {
        const [series] = await db.query(
            "SELECT Id_Series AS id, Title, Genre, Release_Year, Seasons, Language FROM series"
        );
        res.status(200).json(series);
    } catch (error) {
        console.error("Error al obtener series:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Añadir una nueva película
export const addMovie = async (req, res) => {
    const { Title, genreId, releaseYear, duration, language } = req.body;

    try {
        if (!Title || !genreId || !releaseYear || !duration || !language) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        const [result] = await db.query(
            "INSERT INTO movies (Title, Genre, Release_Year, Duration, Language) VALUES (?, ?, ?, ?, ?)",
            [Title, genreId, releaseYear, duration, language]
        );

        res.status(201).json({ id: result.insertId, Title, genreId, releaseYear, duration, language });
    } catch (error) {
        console.error("Error al añadir película:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Añadir una nueva serie
export const addSeries = async (req, res) => {
    const { Title, genreId, releaseYear, seasons, language } = req.body;

    try {
        if (!Title || !genreId || !releaseYear || !seasons || !language) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        const [result] = await db.query(
            "INSERT INTO series (Title, Genre, Release_Year, Seasons, Language) VALUES (?, ?, ?, ?, ?)",
            [Title, genreId, releaseYear, seasons, language]
        );

        res.status(201).json({ id: result.insertId, Title, genreId, releaseYear, seasons, language });
    } catch (error) {
        console.error("Error al añadir serie:", error);
        res.status500.json({ message: "Error interno del servidor." });
    }
};

// 🔹 Modificar una película existente
export const updateMovie = async (req, res) => {
    const movieId = req.params.id;
    const { Title, genreId, releaseYear, duration, language } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE movies SET Title = ?, Genre = ?, Release_Year = ?, Duration = ?, Language = ? WHERE Id_Movie = ?",
            [Title, genreId, releaseYear, duration, language, movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Película no encontrada." });
        }

        res.status(200).json({ message: "Película actualizada correctamente." });
    } catch (error) {
        console.error("Error al modificar película:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Modificar una serie existente
export const updateSeries = async (req, res) => {
    const seriesId = req.params.id;
    const { Title, genreId, releaseYear, seasons, language } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE series SET Title = ?, Genre = ?, Release_Year = ?, Seasons = ?, Language = ? WHERE Id_Series = ?",
            [Title, genreId, releaseYear, seasons, language, seriesId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Serie no encontrada." });
        }

        res.status(200).json({ message: "Serie actualizada correctamente." });
    } catch (error) {
        console.error("Error al modificar serie:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Eliminar una película
export const deleteMovie = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM movies WHERE Id_Movie = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Película no encontrada." });
        }

        res.status(200).json({ message: "Película eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar película:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Eliminar una serie
export const deleteSeries = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM series WHERE Id_Series = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Serie no encontrada." });
        }

        res.status(200).json({ message: "Serie eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar serie:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// 🔹 Obtener géneros
export const getGenres = async (req, res) => {
    try {
        const [genres] = await db.query("SELECT Id_Genre, Name FROM genres");
        res.status(200).json(genres);
    } catch (error) {
        console.error("Error al obtener géneros:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};
