import db from "../config/db.js"; // Importa la configuración de conexión a la base de datos

/**
 * Guarda o actualiza la valoración de un usuario sobre un contenido.
 * - Si ya existe un registro, lo actualiza.
 * - Si no existe, inserta una nueva valoración.
 */
export const saveOrUpdateRating = async (req, res) => {
  const { userId, itemKey, rating } = req.body;

  // Validaciones básicas
  if (!userId || !itemKey || rating == null) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  // Validar que `rating` sea un número entre 1 y 10
  if (typeof rating !== "number" || rating < 1 || rating > 10) {
    return res.status(400).json({ error: "La calificación debe estar entre 1 y 10." });
  }

  try {
    // Intentar actualizar la valoración si ya existe un registro
    const [updateResult] = await db.query(
      "UPDATE ratings SET rating = ?, updated_at = NOW() WHERE user_id = ? AND item_key = ?",
      [rating, userId, itemKey]
    );

    if (updateResult.affectedRows === 0) {
      // Si no existe un registro previo, insertar uno nuevo
      const [insertResult] = await db.query(
        "INSERT INTO ratings (user_id, item_key, rating) VALUES (?, ?, ?)",
        [userId, itemKey, rating]
      );
      return res.status(201).json({ message: "Valoración insertada", id: insertResult.insertId });
    }

    return res.status(200).json({ message: "Valoración actualizada" });
  } catch (error) {
    console.error("Error en saveOrUpdateRating:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Obtiene la agregación de ratings de un contenido.
 * - Calcula el promedio y la cantidad total de valoraciones.
 */
export const getContentRatings = async (req, res) => {
  const { itemKey } = req.params;

  try {
    // Consulta el promedio de calificación y el número total de votos
    const [results] = await db.query(
      "SELECT IFNULL(AVG(rating), 0) AS averageRating, COUNT(*) AS totalVotes FROM ratings WHERE item_key = ?",
      [itemKey]
    );

    return res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error en getContentRatings:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Obtiene todas las valoraciones realizadas por un usuario.
 */
export const getUserRatingsController = async (req, res) => {
  const { userId } = req.params;

  try {
    // Consulta todas las valoraciones realizadas por el usuario
    const [ratings] = await db.query(
      "SELECT item_key, rating FROM ratings WHERE user_id = ?",
      [userId]
    );

    if (ratings.length === 0) {
      return res.status(200).json({ message: "Este usuario aún no ha calificado contenido." });
    }

    return res.status(200).json(ratings);
  } catch (error) {
    console.error("Error en getUserRatingsController:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
