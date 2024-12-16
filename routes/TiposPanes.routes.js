import { Router } from "express"; // Importa el Router de Express
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos

const router = Router(); // Crea una nueva instancia de Router
router.get("/listTiposPanes", async (req, res) => {
  try {
    // Ejecutar la consulta para obtener todos los tipos de panes
    const [rows] = await pool.query("SELECT * FROM tiposdepanes");

    // Enviar los resultados como JSON
    res.json(rows);
  } catch (err) {
    console.error("Error al listar tipos de panes:", err);
    res.status(500).json("Error al listar tipos de panes");
  }
});

router.post("/addTipoPan", async (req, res) => {
  const { Nombre, Descripcion } = req.body;

  // Validar los campos requeridos
  if (!Nombre || !Descripcion) {
    return res
      .status(400)
      .send("Nombre y Descripcion de Tipopan son obligatorios");
  }

  try {
    // Ejecutar la consulta para insertar la nueva producción diaria
    const [result] = await pool.execute(
      `INSERT INTO TiposDePanes (Nombre, Descripcion) 
        VALUES (?, ?)`,
      [Nombre, Descripcion]
    );

    res.status(201).send("Tipo depanes  añadida con éxito");
  } catch (err) {
    console.error("Error al añadir Tipo depanes:", err);
    res.status(500).send("Error al añadir Tipo depanes");
  }
});

router.delete("/deleteTipoPan/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Ejecutar la consulta de eliminación
    const [result] = await pool.execute(
      "DELETE FROM TiposDePanes WHERE IdTipoPan = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res.status(200).send(`Tipo de Pan con ID ${id} eliminado con éxito`);
    } else {
      res.status(404).send(`Tipo de Pan con ID ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al eliminar tipo de pan:", err);
    res.status(500).send("Error al eliminar tipo de pan");
  }
});

router.put("/editTipoPan/:id", async (req, res) => {
  const { id } = req.params;
  const { Nombre, Descripcion } = req.body;

  try {
    // Ejecutar la consulta de actualización
    const [result] = await pool.execute(
      "UPDATE TiposDePanes SET Nombre = ?, Descripcion = ? WHERE IdTipoPan = ?",
      [Nombre, Descripcion, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).send("Tipo de Pan editado con éxito");
    } else {
      res.status(404).send(`Tipo de Pan con ID ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al editar tipo de pan:", err);
    res.status(500).send("Error al editar tipo de pan");
  }
});

export default router;
