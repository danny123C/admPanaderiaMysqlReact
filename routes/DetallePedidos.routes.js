import { Router } from "express";
// import sql from "mssql";
import pool from "../src/database.js"; // Asegúrate de que pool esté exportado correctamente

const router = Router();

router.get("/detallePedido/:idPedido", async (req, res) => {
  const { idPedido } = req.params;
  try {
    // Obtener una conexión del pool
    const connection = await pool.getConnection();

    // Ejecutar la consulta usando el método `query` de mysql2/promise
    const [rows] = await connection.query(
      `
      SELECT 
        dp.IdDetalle,
        tp.Nombre AS NombreTipoPan,
        dp.Cantidad,
        dp.PrecioUnitario,
        dp.Subtotal
      FROM 
        detallepedidos dp
      JOIN 
        tiposdepanes tp ON dp.IdTipoPan = tp.IdTipoPan
      WHERE 
        dp.IdPedido = ?
    `,
      [idPedido]
    );

    connection.release(); // Liberar la conexión al pool

    // Responder con los resultados de la consulta
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .send(`Error al obtener detalles del pedido: ${err.message}`);
  }
});

router.post("/addDetallePedido", async (req, res) => {
  const { IdPedido, IdTipoPan, Cantidad, PrecioUnitario } = req.body;

  // Verificar que los campos requeridos estén presentes y sean válidos
  if (!IdPedido || !IdTipoPan || !Cantidad || !PrecioUnitario) {
    return res.status(400).send("Todos los campos son necesarios");
  }

  try {
    // Obtener una conexión del pool
    const connection = await pool.getConnection();

    // Ejecutar la consulta para insertar el nuevo detalle de pedido
    const [result] = await connection.query(
      `
      INSERT INTO detallepedidos (IdPedido, IdTipoPan, Cantidad, PrecioUnitario)
      VALUES (?, ?, ?, ?)
    `,
      [IdPedido, IdTipoPan, Cantidad, PrecioUnitario]
    );

    connection.release(); // Liberar la conexión al pool

    // Verificar si la inserción fue exitosa
    if (result.affectedRows > 0) {
      res.status(201).send("DetallePedido añadido con éxito");
    } else {
      res.status(400).send("No se pudo añadir el detalle del pedido");
    }
  } catch (err) {
    res.status(500).send("Error al añadir DetallePedido");
  }
});
router.delete("/deleteDetallePedido/:id", async (req, res) => {
  const { id } = req.params; // Extraemos el ID desde los parámetros de la URL

  // Validar que el ID es un número
  if (isNaN(id)) {
    return res.status(400).send("El ID proporcionado no es válido");
  }

  try {
    // Obtener la conexión desde el pool
    const connection = await pool.getConnection();

    // Realizar la consulta para eliminar el DetallePedido
    const [result] = await connection.query(
      "DELETE FROM detallepedidos WHERE IdDetalle = ?",
      [id]
    );

    // Liberar la conexión después de realizar la consulta
    connection.release();

    // Verificar si el DetallePedido fue eliminado correctamente
    if (result.affectedRows > 0) {
      res
        .status(200)
        .send(`El DETALLE PEDIDO con ID ${id} fue eliminado con éxito`);
    } else {
      res.status(404).send(`DETALLE PEDIDO con el ID ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al eliminar DETALLE PEDIDO:", err);
    res.status(500).send("Error al eliminar DETALLE PEDIDO");
  }
});
///RndPOit Editar
router.put("/editDetallePedido/:id", async (req, res) => {
  const { id } = req.params;
  const { IdTipoPan, Cantidad, PrecioUnitario } = req.body;

  // Validación básica de los parámetros
  if (!IdTipoPan || !Cantidad || !PrecioUnitario) {
    return res.status(400).send("Todos los campos son requeridos");
  }

  try {
    const result = await pool
      .request()
      .input("IdDetalle", id)
      .input("IdTipoPan", IdTipoPan)
      .input("Cantidad", Cantidad)
      .input("PrecioUnitario", PrecioUnitario).query(`
        UPDATE detallepedidos 
        SET IdTipoPan=@IdTipoPan, Cantidad=@Cantidad, PrecioUnitario=@PrecioUnitario
        WHERE IdDetalle = @IdDetalle
      `);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "DetallePedido editado con éxito" });
    } else {
      res.status(404).json({ message: "DetallePedido no encontrado" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error al editar DetallePedido" });
  }
});

export default router;
