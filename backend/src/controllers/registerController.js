import bcrypt from "bcrypt"; // Importa bcrypt para encriptación segura de contraseñas
import db from "../config/db.js"; // Importa la configuración de conexión a la base de datos

/**
 * Registra un nuevo usuario en la base de datos.
 * - Verifica que el correo no esté ya registrado.
 * - Inserta los datos del usuario en la tabla "users".
 * - Encripta la contraseña antes de almacenarla en "plan_familiar".
 */
export const registerUser = async (userData) => {
    try {
        const { name, email, address, avatar, subscription, password } = userData; // Extrae los datos enviados en la solicitud

        // Validar que todos los datos obligatorios estén presentes
        if (!name || !email || !address || !avatar || !subscription || !password) {
            throw new Error("Faltan datos para el registro.");
        }

        // 🔹 Verificar si el correo ya está registrado en "users"
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            throw new Error("Este correo ya está registrado.");
        }

        // 🔹 Insertar usuario en "users" con los datos principales (sin contraseña)
        const [userResult] = await db.query(
            "INSERT INTO users (Name, Email, Address, Avatar, id_subscription) VALUES (?, ?, ?, ?, ?)",
            [name, email, address, avatar, subscription]
        );

        const userId = userResult.insertId; // Obtiene el ID del usuario recién registrado

        // 🔹 Generar un hash seguro para la contraseña con bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 🔹 Insertar la contraseña en la tabla "plan_familiar", asociándola al usuario
        await db.query(
            "INSERT INTO plan_familiar (User, Password) VALUES (?, ?)",
            [userId, hashedPassword]
        );

        return { userId, name, email, address, avatar, subscription }; // Devuelve los datos del usuario registrado
    } catch (error) {
        console.error("Error al registrar usuario:", error); // Registra el error en consola
        throw new Error("Error en el servidor al registrar usuario."); // Envía un mensaje de error
    }
};
