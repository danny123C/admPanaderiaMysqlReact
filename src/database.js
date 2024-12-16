import mysql from "mysql2/promise"; // Importar versión con soporte para Promesas
import { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } from "./config.js";

// Configuración del pool de conexiones
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
});

// Exportar el pool para usarlo en otras partes de la aplicación
export default pool;

// Probar la conexión (opcional)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Conectado a MySQL con éxito.");
    connection.release(); // Liberar la conexión al pool
  } catch (err) {
    console.error("Error al conectar a MySQL:", err);
  }
})();
