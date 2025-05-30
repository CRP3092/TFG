import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import db from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_segura";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_clave_secreta";

/*Registro de usuario */
export const register = async (req, res) => {
    const { name, email, address, password, avatar } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO user (Name, Email, Address, Password, Avatar) VALUES (?, ?, ?, ?, ?)",
            [name, email, address, hashedPassword, avatar]
        );

        res.status(201).json({ message: "Usuario registrado con éxito." });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "El email ya está registrado." });
        }
        res.status(500).json({ message: "Error interno en el servidor." });
    }
};

/*Login de usuario */
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [userRows] = await db.query("SELECT Id_User, Name, Email, Avatar, Password FROM user WHERE Email = ?", [email]);

        if (userRows.length === 0) return res.status(404).json({ message: "Usuario no encontrado." });

        const user = userRows[0];
        const isValidPassword = await bcrypt.compare(password, user.Password);

        if (!isValidPassword) return res.status(401).json({ message: "Contraseña incorrecta." });

        const accessToken = jwt.sign({ userId: user.Id_User, name: user.Name, email: user.Email, avatar: user.Avatar }, JWT_SECRET, { expiresIn: "15m" });

        res.status(200).json({ message: "Login exitoso", accessToken });
    } catch (error) {
        res.status(500).json({ message: "Error interno en el servidor." });
    }
};

/*Cierre de sesión */
export const logout = async (req, res) => {
    try {
        const { userId } = req.body;
        await db.query("UPDATE user SET RefreshToken = NULL WHERE Id_User = ?", [userId]);
        res.status(200).json({ message: "Sesión cerrada correctamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al cerrar sesión." });
    }
};

/*Solicitud de recuperación de contraseña */
export const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const token = crypto.randomBytes(32).toString("hex");
        const expiration = new Date(Date.now() + 3600000); // 1 hora
        await db.query("UPDATE user SET ResetToken = ?, ResetTokenExpire = ? WHERE Email = ?", [token, expiration, email]);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
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

/*Verificación de email */
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const [userRows] = await db.query("SELECT * FROM user WHERE Email = ? AND VerificationCode = ?", [email, code]);
        if (userRows.length === 0) return res.status(400).json({ message: "Código de verificación incorrecto." });

        await db.query("UPDATE user SET Verified = 1 WHERE Email = ?", [email]);
        res.status(200).json({ message: "Cuenta verificada correctamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al verificar email." });
    }
};

export const getAvatars = async (req, res) => {
    try {
        const [avatars] = await db.query("SELECT Avatar FROM avatar");
        res.status(200).json(avatars);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener avatares." });
    }
};

export const testDatabase = async (req, res) => {
    try {
        const [avatars] = await db.query("SELECT * FROM avatar");
        console.log("Avatares en BD:", avatars); // 🔹 Verifica qué datos recibe el backend
        res.status(200).json(avatars);
    } catch (error) {
        console.error("Error en la consulta SQL:", error);
        res.status(500).json({ message: "Error al obtener avatares de la base de datos." });
    }
};
