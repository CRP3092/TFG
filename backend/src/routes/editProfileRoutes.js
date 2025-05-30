import express from "express"; // Importa Express para gestionar rutas HTTP
import db from "../config/db.js"; // Importa la configuración de la base de datos

const router = express.Router(); // Crea una instancia de router para definir rutas

/**
 * GET /api/edit-profile/:id
 * Obtiene los datos del usuario para ser editados antes de una modificación.
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Obtiene el ID del usuario desde la URL
    const [rows] = await db.query(
      "SELECT Name, Email, Address, avatar FROM users WHERE Id_User = ?",
      [userId] // Consulta los datos actuales del usuario en la base de datos
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" }); // Devuelve un error si el usuario no existe
    }

    res.json(rows[0]); // Envía los datos del usuario en formato JSON
  } catch (error) {
    console.error("Error al obtener el perfil para edición:", error); // Registra el error en consola para depuración
    res.status(500).json({ error: "Error interno del servidor" }); // Envía un mensaje de error al cliente
  }
});

/**
 * PUT /api/edit-profile/:id
 * Actualiza los datos del usuario en la base de datos.
 * Se espera recibir en el cuerpo de la petición:
 *  - Name (Nombre)
 *  - Email (Correo electrónico)
 *  - Address (Dirección)
 *  - avatar (URL o archivo de imagen del avatar)
 */
router.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Obtiene el ID de usuario desde la URL
    const { Name, Email, Address, avatar } = req.body; // Extrae los datos a actualizar

    // Actualiza los datos del usuario en la base de datos
    const [result] = await db.query(
      "UPDATE users SET Name = ?, Email = ?, Address = ?, avatar = ? WHERE Id_User = ?",
      [Name, Email, Address, avatar, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" }); // Devuelve error si el usuario no existe
    }

    // Se consulta el usuario actualizado en la base de datos para enviarlo en la respuesta
    const [rows] = await db.query("SELECT * FROM users WHERE Id_User = ?", [userId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado después de la actualización" });
    }

    res.json(rows[0]); // Retorna la información actualizada del usuario
  } catch (error) {
    console.error("Error actualizando el perfil:", error); // Registra el error en consola para depuración
    res.status(500).json({ error: "Error interno del servidor al actualizar el perfil" }); // Envía un mensaje de error al cliente
  }
});

export default router; // Exporta el router para su uso en otras partes del servidor
