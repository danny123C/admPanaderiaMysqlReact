import { Router } from "express"; // Importa el Router de Express
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos

const router = Router(); // Crea una nueva instancia de Router

// Endpoint Listar Materiales
router.get("/listMateriales", async (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const [rows] = await pool.query(
      `SELECT 
          m.Id,
          tp.Nombre AS TipoDePan,
          m.Fecha,
          m.Harina,
          m.Manteca,
          m.Mantequilla,
          m.Azucar,
          m.Sal,
          m.Levadura,
          m.Agua,
          m.PanMolido,
          m.Extras,
          m.Observaciones
        FROM 
          Materiales m
        JOIN 
          TiposDePanes tp 
        ON 
          m.IdTipoPan = tp.IdTipoPan
        ORDER BY 
          m.Fecha DESC
        LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM Materiales;`
    );

    const total = countResult[0].total;

    res.json({
      data: rows,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener la lista de materiales" });
  }
});

// Endpoint Agregar Materiales
router.post("/addMateriales", async (req, res) => {
  try {
    const {
      IdTipoPan,
      Fecha,
      Harina,
      Manteca,
      Mantequilla,
      Azucar,
      Sal,
      Levadura,
      Agua = null, // Valor por defecto si no se proporciona
      PanMolido = 0, // Valor por defecto si no se proporciona
      Extras = null, // Valor por defecto si no se proporciona
      Observaciones = null, // Valor por defecto si no se proporciona
    } = req.body;

    // Validación para campos obligatorios
    if (
      !IdTipoPan ||
      !Manteca ||
      !Mantequilla ||
      !Azucar ||
      !Sal ||
      !Levadura
    ) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Consulta para insertar en la base de datos
    await pool.query(
      `
        INSERT INTO Materiales (
          IdTipoPan, Fecha, Harina, Manteca, Mantequilla, Azucar, Sal, Levadura, Agua, PanMolido, Extras, Observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NULL), COALESCE(?, 0), ?, ?)
      `,
      [
        IdTipoPan,
        Fecha,
        Harina,
        Manteca,
        Mantequilla,
        Azucar,
        Sal,
        Levadura,
        Agua,
        PanMolido,
        Extras,
        Observaciones,
      ]
    );

    res.status(201).json({ message: "Materiales añadidos correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint Editar Materiales
router.put("/editMateriales/:id", async (req, res) => {
  const { id } = req.params;
  const {
    IdTipoPan,
    Fecha,
    Harina,
    Manteca,
    Mantequilla,
    Azucar,
    Sal,
    Levadura,
    Agua,
    PanMolido,
    Extras,
    Observaciones,
  } = req.body;

  try {
    // Validar datos obligatorios
    if (
      !IdTipoPan ||
      !Harina ||
      !Manteca ||
      !Mantequilla ||
      !Azucar ||
      !Sal ||
      !Levadura ||
      !Agua
    ) {
      console.log(
        IdTipoPan,
        Harina,
        Manteca,
        Mantequilla,
        Azucar,
        Sal,
        Levadura,
        Agua
      );
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    const query = `
    UPDATE Materiales
    SET 
      IdTipoPan = ?, 
      Fecha = ?,
      Harina = ?,
      Manteca = ?, 
      Mantequilla = ?, 
      Azucar = ?, 
      Sal = ?, 
      Levadura = ?, 
      Agua = ?, 
      PanMolido = COALESCE(?, 0), 
      Extras = COALESCE(?, NULL), 
      Observaciones = COALESCE(?, NULL)
    WHERE Id = ?
  `;

    const [result] = await pool.query(query, [
      IdTipoPan,
      Fecha,
      Harina,
      Manteca,
      Mantequilla,
      Azucar,
      Sal,
      Levadura,
      Agua,
      PanMolido,
      Extras,
      Observaciones,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Material no encontrado" });
    }

    res.status(200).json({ message: "Material editado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint Eliminar Materiales
router.delete("/deleteMateriales/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM Materiales WHERE Id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Material no encontrado" });
    }

    res.status(200).json({ message: "Material eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
