import { Router } from "express";
import pool from "../src/database.js";

const router = Router();

router.get("/listTiposPanes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tiposdepanes");
    res.json(rows);
  } catch (err) {
    console.error("Error al listar tipos de panes:", err.message);
    res.status(500).json({ message: "Error al listar tipos de panes" });
  }
});

router.post("/addTipoPan", async (req, res) => {
  const { Nombre, Descripcion } = req.body;

  if (!Nombre || !Descripcion) {
    return res
      .status(400)
      .json({ message: "Nombre y Descripcion son obligatorios" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO tiposdepanes (Nombre, Descripcion) VALUES (?, ?)",
      [Nombre, Descripcion]
    );

    res
      .status(201)
      .json({ message: "Tipo de Pan añadido con éxito", id: result.insertId });
  } catch (err) {
    console.error("Error al añadir Tipo de Pan:", err.message);
    res.status(500).json({ message: "Error al añadir Tipo de Pan" });
  }
});

router.delete("/deleteTipoPan/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      "DELETE FROM tiposdepanes WHERE IdTipoPan = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ message: `Tipo de Pan con ID ${id} eliminado con éxito` });
    } else {
      res
        .status(404)
        .json({ message: `Tipo de Pan con ID ${id} no encontrado` });
    }
  } catch (err) {
    console.error(`Error al eliminar Tipo de Pan con ID ${id}:`, err.message);
    res.status(500).json({ message: "Error al eliminar Tipo de Pan" });
  }
});

router.put("/editTipoPan/:id", async (req, res) => {
  const { id } = req.params;
  const { Nombre, Descripcion } = req.body;

  if (!Nombre || !Descripcion) {
    return res
      .status(400)
      .json({ message: "Nombre y Descripcion son obligatorios" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE tiposdepanes SET Nombre = ?, Descripcion = ? WHERE IdTipoPan = ?",
      [Nombre, Descripcion, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Tipo de Pan editado con éxito",
        data: { id, Nombre, Descripcion },
      });
    } else {
      res
        .status(404)
        .json({ message: `Tipo de Pan con ID ${id} no encontrado` });
    }
  } catch (err) {
    console.error(`Error al editar Tipo de Pan con ID ${id}:`, err.message);
    res.status(500).json({ message: "Error al editar Tipo de Pan" });
  }
});

export default router;
