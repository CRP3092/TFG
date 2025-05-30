import jwt from "jsonwebtoken"; // Importa el módulo jsonwebtoken para manejar tokens JWT

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_segura"; // Define la clave secreta para verificar los tokens, usando la variable de entorno si está disponible

/**
 * Middleware para autenticar usuarios mediante JWT.
 * - Verifica que el token de autenticación esté presente y sea válido.
 * - Si el token es correcto, asigna los datos del usuario a req.user y permite continuar con la ejecución.
 */
export const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization"); // Obtiene el token de autorización desde los headers de la solicitud

    // Verifica que el token esté presente y tenga el formato adecuado
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Acceso denegado. No hay token válido." }); // Responde con un error si el token no es válido
    }

    try {
        // Elimina el prefijo "Bearer " y verifica el token utilizando la clave secreta
        const verified = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = verified; // Asigna la información del usuario verificado a req.user
        next(); // Continúa con la ejecución del siguiente middleware o controlador
    } catch (error) {
        console.error("Error al verificar el token:", error); // Registra el error en la consola para depuración
        res.status(401).json({ message: "Token inválido o expirado." }); // Envía un mensaje de error al cliente en caso de token no válido
    }
};

/**
 * Middleware para verificar si un usuario es administrador.
 * - Si el usuario autenticado no tiene el rol "admin", se le deniega el acceso.
 */
export const isAdmin = (req, res, next) => {
    // Verifica que el usuario esté autenticado y tenga rol de administrador
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Acceso denegado. Solo administradores pueden acceder." }); // Responde con error si el usuario no es administrador
    }
    next(); // Continúa con la ejecución del siguiente middleware o controlador
};
