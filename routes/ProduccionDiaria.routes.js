import { Router } from "express"; // Importa el Router de Express
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos

const router = Router(); // Crea una nueva instancia de Router
// Ruta para listar la producción diaria
router.get("/listProduccionDiaria", async (req, res) => {
  // Obtener los parámetros de paginación
  const limit = parseInt(req.query.limit) || 15; // Límite de registros por defecto: 15
  const offset = parseInt(req.query.offset) || 0; // Desplazamiento por defecto: 0

  try {
    // Ejecutar la consulta con LIMIT y OFFSET para obtener los registros paginados
    const [rows] = await pool.query(
      `SELECT 
              pd.IdProduccion,
              tp.Nombre AS NombreDelPan,
              pd.Cantidad,
              pd.Fecha,
              pd.PanFaltante,
              pd.PanSobrante,
              pd.Observaciones
           FROM 
              ProduccionDiaria pd
           JOIN 
              TiposDePanes tp 
           ON 
              pd.IdTipoPan = tp.IdTipoPan
           ORDER BY 
              pd.Fecha DESC
           LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    // Ejecutar una consulta adicional para obtener el total de registros
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM ProduccionDiaria;`
    );

    const total = countResult[0].total; // Extraer el total de registros

    // Enviar la respuesta al cliente con los datos y paginación
    res.json({
      data: rows,
      pagination: {
        limit,
        offset,
        total, // Agregar el número total de registros
      },
    });
  } catch (err) {
    console.error("Error al listar la producción diaria:", err);
    res.status(500).send("Error al obtener la lista de producción diaria");
  }
});

router.post("/addProduccionDiaria", async (req, res) => {
  try {
    const {
      IdTipoPan,
      Cantidad,
      Fecha,
      PanFaltante,
      PanSobrante,
      Observaciones,
    } = req.body;

    // Verifica que los datos sean válidos
    if (!IdTipoPan || !Cantidad || !Fecha) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Consulta SQL
    await pool.query(
      `
      INSERT INTO ProduccionDiaria (IdTipoPan, Cantidad, Fecha, PanFaltante, PanSobrante, Observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        IdTipoPan,
        Cantidad,
        Fecha,
        PanFaltante || null,
        PanSobrante || null,
        Observaciones || null,
      ]
    );

    res.status(201).json({ message: "Producción añadida correctamente" });
  } catch (error) {
    console.error("Error al añadir Producción:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/deleteProduccionDiaria/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      "DELETE FROM ProduccionDiaria WHERE IdProduccion = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res.status(200).send(`Producción con ID ${id} eliminada con éxito`);
    } else {
      res.status(404).send(`Producción con ID ${id} no encontrada`);
    }
  } catch (err) {
    console.error("Error al eliminar Producción Diaria:", err);
    res.status(500).send("Error al eliminar Producción Diaria");
  }
});

// Endpoint para editar un tipo de pan por ID
router.put("/editProduccionDiaria/:id", async (req, res) => {
  const { id } = req.params;
  const {
    IdTipoPan,
    Cantidad,
    Fecha,
    PanFaltante,
    PanSobrante,
    Observaciones,
  } = req.body;

  try {
    const [result] = await pool.execute(
      `
      UPDATE ProduccionDiaria
      SET 
        Cantidad = ?, 
        Fecha = ?, 
        PanFaltante = ?, 
        PanSobrante = ?, 
        Observaciones = ?
      WHERE IdProduccion = ?;
    `,
      [Cantidad, Fecha, PanFaltante, PanSobrante, Observaciones, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).send("Producción Diaria editada con éxito");
    } else {
      res.status(404).send(`Producción con ID ${id} no encontrada`);
    }
  } catch (err) {
    console.error("Error al editar Producción Diaria:", err);
    res.status(500).send("Error al editar Producción Diaria");
  }
});

export default router;
