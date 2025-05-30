import bcrypt from "bcrypt"; // Importa bcrypt para encriptación de contraseñas
import jwt from "jsonwebtoken"; // Importa jsonwebtoken para la generación y verificación de tokens JWT
import db from "../config/db.js"; // Importa la configuración de la base de datos

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_segura"; // Define la clave secreta para los tokens JWT

/**
 * Autenticación de usuario mediante email y contraseña.
 * - Verifica credenciales en la base de datos.
 * - Genera un token de sesión si la autenticación es exitosa.
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // Extrae email y contraseña desde la solicitud

        // 🔹 Buscar usuario en la base de datos junto con su rol
        const [userResult] = await db.query("SELECT Id_User, Name, Email, role FROM users WHERE Email = ?", [email]);

        // Si el usuario no existe, retorna un error de autenticación
        if (userResult.length === 0) {
            return res.status(401).json({ message: "Correo no registrado." });
        }

        const user = userResult[0]; // Extrae los datos del usuario encontrado

        // 🔹 Obtener la contraseña almacenada en la tabla `plan_familiar`
        const [passwordResult] = await db.query("SELECT Password FROM plan_familiar WHERE User = ?", [user.Id_User]);

        // Si no se encuentra una contraseña válida, retorna un error
        if (!passwordResult.length || !passwordResult[0].Password) {
            return res.status(401).json({ message: "No se encontró una contraseña válida." });
        }

        const storedPassword = passwordResult[0].Password; // Extrae la contraseña almacenada

        // 🔹 Comparar la contraseña ingresada con la encriptada en la base de datos
        const isMatch = await bcrypt.compare(password, storedPassword);

        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta." });
        }

        // 🔹 Generar token JWT con los datos del usuario
        const token = jwt.sign(
            { id: user.Id_User, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "2h" } // El token expira en 2 horas
        );

        res.status(200).json({ 
            message: "Login exitoso.",
            token, 
            user: { id: user.Id_User, name: user.Name, role: user.role }
        });

    } catch (error) {
        console.error("Error en el login:", error); // Registra el error en la consola
        res.status(500).json({ message: "Error en el servidor al iniciar sesión." }); // Retorna un mensaje de error genérico
    }
};
