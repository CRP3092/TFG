import nodemailer from "nodemailer"; // Importa el módulo para el envío de correos electrónicos
import crypto from "crypto"; // Importa el módulo para generar tokens aleatorios
import bcrypt from "bcrypt"; // Importa bcrypt para la encriptación de contraseñas
import jwt from "jsonwebtoken"; // Importa jsonwebtoken para manejar autenticación basada en tokens
import db from "../config/db.js"; // Importa la configuración de conexión a la base de datos
import config from "../utils/config.js"; // Importa configuración general, incluyendo API_URL
import dotenv from "dotenv"; // Importa dotenv para la gestión de variables de entorno

dotenv.config(); // Carga las variables de entorno desde el archivo .env

/**
 * Registro de usuario
 * - Crea un nuevo usuario en la base de datos.
 * - Encripta la contraseña y asigna un avatar.
 */
export const register = async (req, res) => {
  const { name, email, address, password, avatar, subscription } = req.body;

  try {
    if (!avatar) {
      return res.status(400).json({ error: "Debes seleccionar un avatar." });
    }

    // Encriptación de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserción del usuario en la tabla "users" sin asignar avatar aún
    const [userResult] = await db.query(
      "INSERT INTO users (Name, Email, Address, Avatar, id_subscription) VALUES (?, ?, ?, NULL, ?)",
      [name, email, address, subscription]
    );
    const userId = parseInt(userResult.insertId, 10);

    // Normalización de la URL del avatar
    let normalizedAvatar = avatar;
    try {
      const urlObj = new URL(avatar);
      normalizedAvatar = urlObj.pathname; // Extrae la ruta relativa si la URL es válida
    } catch (e) {
      normalizedAvatar = avatar; // Usa la ruta directamente si ya es relativa
    }

    // Verificar si el avatar ya existe en la tabla "avatar"
    const [existingAvatars] = await db.query(
      "SELECT Id_Avatar FROM avatar WHERE Avatar = ?",
      [normalizedAvatar]
    );
    let avatarId;
    if (existingAvatars.length > 0) {
        avatarId = existingAvatars[0].Id_Avatar;
    } else {
        const [avatarResult] = await db.query(
          "INSERT INTO avatar (Avatar, Description) VALUES (?, ?)",
          [normalizedAvatar, "Avatar seleccionado"]
        );
        avatarId = parseInt(avatarResult.insertId, 10);
    }      

    // Asignar el avatar al usuario recién creado
    await db.query("UPDATE users SET Avatar = ? WHERE Id_User = ?", [avatarId, userId]);

    // Inserción de la contraseña en "plan_familiar" vinculada al usuario
    await db.query("INSERT INTO plan_familiar (User, Password) VALUES (?, ?)", [userId, hashedPassword]);

    res.json({ message: "Usuario registrado con éxito", userId, avatarId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Autenticación de usuario
 * - Verifica credenciales en la base de datos.
 * - Consulta el avatar asociado al usuario.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Consultar usuario y su avatar mediante LEFT JOIN
    const [results] = await db.query(
      `SELECT u.Id_User, u.Name, u.Email, u.role, a.Avatar AS avatar_url
       FROM users u 
       LEFT JOIN avatar a ON u.Avatar = a.Id_Avatar 
       WHERE u.Email = ?`,
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];

    // Normalizar la ruta del avatar
    let avatarPath = user.avatar_url;
    if (!avatarPath || avatarPath === "undefined") {
      avatarPath = "/uploads/avatars/default-avatar.jpg"; // Avatar por defecto si no se encuentra uno asignado
    }

    // Obtener la contraseña almacenada
    const [pfResults] = await db.query(
      "SELECT Password FROM plan_familiar WHERE User = ?",
      [user.Id_User]
    );

    if (pfResults.length === 0) {
      return res.status(401).json({ error: "No se encontró contraseña para este usuario" });
    }

    const storedPassword = pfResults[0].Password;
    const isValidPassword = await bcrypt.compare(password, storedPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Formar el objeto usuario para la respuesta
    const userResponse = {
      id: user.Id_User,
      name: user.Name,
      email: user.Email,
      role: user.role,
      avatar: user.avatar_url
        ? `${config.API_URL}${user.avatar_url}`
        : `${config.API_URL}/uploads/avatars/default-avatar.jpg`
    };

    const token = jwt.sign(
      { id: user.Id_User, email: user.Email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cerrar sesión
 * - Elimina el RefreshToken del usuario para cerrar su sesión.
 */
export const logout = async (req, res) => {
  try {
    const { userId } = req.body;
    await db.query("UPDATE users SET RefreshToken = NULL WHERE Id_User = ?", [userId]);
    res.status(200).json({ message: "Sesión cerrada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión." });
  }
};

/**
 * Solicitud de restablecimiento de contraseña.
 * - Genera un token y lo envía por correo al usuario.
 */
export const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 3600000); // 1 hora
    await db.query("UPDATE users SET ResetToken = ?, ResetTokenExpire = ? WHERE Email = ?", [token, expiration, email]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Restablecer contraseña",
      text: `Usa este enlace para restablecer tu contraseña: http://localhost:3000/reset/${token}`
    });

    res.status(200).json({ message: "Correo de recuperación enviado." });
  } catch (error) {
    res.status(500).json({ message: "Error al enviar el correo." });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const [userRows] = await db.query("SELECT * FROM users WHERE Email = ? AND VerificationCode = ?", [email, code]);
    if (userRows.length === 0) {
      return res.status(400).json({ message: "Código de verificación incorrecto." });
    }
    await db.query("UPDATE users SET Verified = 1 WHERE Email = ?", [email]);
    res.status(200).json({ message: "Cuenta verificada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al verificar email." });
  }
};
