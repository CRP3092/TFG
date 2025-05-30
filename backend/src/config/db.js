import mysql from "mysql2/promise"; // Importa la biblioteca mysql2/promise para manejar conexiones de base de datos asíncronas
import dotenv from "dotenv"; // Importa dotenv para gestionar variables de entorno

dotenv.config(); // Carga las variables de entorno desde el archivo .env

// 🔹 Configuración del pool de conexiones a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST, // Dirección del servidor de la base de datos, obtenida desde las variables de entorno
  user: process.env.DB_USER, // Nombre de usuario para conectarse a la base de datos
  password: process.env.DB_PASSWORD || "", // Contraseña del usuario, con opción de valor por defecto vacío
  database: "BlockBuster", // Nombre de la base de datos utilizada
  waitForConnections: true, // Espera conexiones en la cola cuando todas están ocupadas
  connectionLimit: 10, // Número máximo de conexiones simultáneas permitidas en el pool
  queueLimit: 0 // Límite de solicitudes en la cola cuando el pool está ocupado (0 significa sin límite)
});

// 🔹 Función para comprobar la conexión a la base de datos al iniciar el servidor
async function testConnection() {
  try {
    const connection = await db.getConnection(); // Obtiene una conexión del pool
    connection.release(); // Libera la conexión para que pueda ser reutilizada
  } catch (error) {
    console.error("Error en la conexión a la base de datos:", error); // Registra el error en consola para depuración
    process.exit(1); // Detiene el servidor si la conexión falla
  }
}

// Ejecuta la comprobación de conexión al iniciar
testConnection();

export default db; // Exporta la configuración de la base de datos para ser utilizada en otras partes del proyecto
