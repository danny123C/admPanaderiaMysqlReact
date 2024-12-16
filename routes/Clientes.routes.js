import { Router } from "express"; // Importa el Router de Express
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router

// Endpoint para obtener la lista de clientes
router.get("/listClientes", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM clientes"); // Usando `mysql2` con Promesas
    res.json(rows); // Devuelve los resultados
  } catch (err) {
    res.status(500).send("Error al obtener la lista de clientes");
  }
});

// Endpoint para agregar un cliente
router.post("/addClientes", async (req, res) => {
  const { Nombre, Telefono, Email } = req.body;

  if (!Nombre) {
    return res.status(400).send("Nombre es necesario");
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO clientes (Nombre, Telefono, Email) VALUES (?, ?, ?)",
      [Nombre, Telefono, Email] // Usando placeholders `?` para evitar inyecciones SQL
    );
    res.status(201).send("Cliente añadido con éxito");
  } catch (err) {
    res.status(500).send("Error al añadir cliente");
  }
});

// Endpoint para eliminar un cliente
router.delete("/deleteCliente/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      "DELETE FROM clientes WHERE IdCliente = ?",
      [id] // Usando placeholders `?`
    );

    if (result.affectedRows > 0) {
      res.status(200).send(`El Cliente con ID ${id} fue eliminado con éxito`);
    } else {
      res.status(404).send(`Cliente con el ID ${id} no encontrado`);
    }
  } catch (err) {
    res.status(500).send("Error al eliminar cliente");
  }
});

// Endpoint para editar un cliente
router.put("/editCliente/:id", async (req, res) => {
  const { id } = req.params;
  const { Nombre, Telefono, Email } = req.body;

  try {
    const [result] = await pool.execute(
      "UPDATE clientes SET Nombre = ?, Telefono = ?, Email = ? WHERE IdCliente = ?",
      [Nombre, Telefono, Email, id] // Usando placeholders `?` y los valores correspondientes
    );

    if (result.affectedRows === 0) {
      res.status(400).send("Error al editar: No se encontró el cliente");
    } else {
      res.status(200).send("Cliente editado con éxito");
    }
  } catch (err) {
    res.status(500).send("Error al editar cliente");
  }
});

export default router;
