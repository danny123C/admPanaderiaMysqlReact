// Importa las dependencias necesarias
import { Router } from "express";
import pool from "../src/database.js"; // Conexión a la base de datos
import bcrypt from "bcrypt"; // Encriptar contraseñas
import jwt from "jsonwebtoken"; // Importa jsonwebtoken

const router = Router();

// Clave secreta para firmar los tokens
const SECRET_KEY = "TuClaveSecretaSuperSegura"; // Asegúrate de cambiar esta clave secreta en producción

// Ruta para iniciar sesión
// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  const { Usuario, Contraseña } = req.body;

  try {
    // Consulta para buscar al usuario por nombre de usuario
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE Usuario = ?",
      [Usuario]
    );
    // Validar si el usuario existe
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const usuario = rows[0];
    // Verificar si el usuario está aprobado y es administrador
    if (usuario.Aprobado !== 1 || usuario.EsAdministrador !== 1) {
      return res.status(403).json({
        error: "Acceso denegado. Usuario no aprobado o no es administrador.",
      });
    }

    // Verificar la contraseña encriptada
    const passwordMatch = await bcrypt.compare(Contraseña, usuario.Contraseña);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    // Generar un token JWT
    const token = jwt.sign(
      {
        id: usuario.Id,
        Usuario: usuario.Usuario,
        Aprobado: usuario.Aprobado,
        EsAdministrador: usuario.EsAdministrador,
      },
      SECRET_KEY,
      { expiresIn: "1h" } // El token expira en 1 hora
    );

    // Responder con el token generado
    res.json({ message: "Login exitoso.", token });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// Ruta para crear un nuevo usuario
router.post("/crearUsuario", async (req, res) => {
  const { Usuario, Contraseña } = req.body;

  // Validar la entrada
  if (!Usuario || !Contraseña) {
    return res
      .status(400)
      .json({ error: "Usuario y Contraseña son requeridos." });
  }

  try {
    // Verificar si el usuario ya existe
    const [usuarioExistente] = await pool.execute(
      "SELECT * FROM Usuarios WHERE Usuario = ?",
      [Usuario]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe." });
    }

    // Encriptar la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(Contraseña, 10);

    // Insertar el nuevo usuario en la base de datos
    await pool.execute(
      `INSERT INTO Usuarios (Usuario, Contraseña, FechaCreacion, EsAdministrador, Aprobado) 
      VALUES (?, ?, NOW(), 0, 0)`,
      [Usuario, hashedPassword]
    );

    res.status(201).json({ message: "Usuario creado exitosamente." });
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Endpoint para obtener la lista de usuarios
router.get("/listUsuarios", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM Usuarios"); // Usando `mysql2` con Promesas
    res.json(rows); // Devuelve los resultados
  } catch (err) {
    res.status(500).send("Error al obtener la lista de Usuarios");
  }
});
// Endpoint para editar un Usuario
router.put("/editUsuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { Usuario, EsAdministrador, Aprobado } = req.body;

  try {
    // Consulta SQL para actualizar el usuario
    const [result] = await pool.execute(
      "UPDATE Usuarios SET Usuario = ?, EsAdministrador = ?, Aprobado = ? WHERE Id = ?",
      [Usuario, EsAdministrador, Aprobado, id] // Columna y valores en orden
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado o sin cambios." });
    }

    res.status(200).json({ message: "Usuario editado con éxito" });
  } catch (err) {
    res.status(500).json({ error: "Error al editar usuario" });
  }
});
// Endpoint para eliminar un usuario
router.delete("/deleteUsuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Consulta SQL para eliminar al usuario por su ID
    const [result] = await pool.execute("DELETE FROM Usuarios WHERE Id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json({ message: "Usuario eliminado con éxito." });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario." });
  }
});

export default router;
