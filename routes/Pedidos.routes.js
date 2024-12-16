import { request, Router } from "express"; // Importa el Router de Express
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router
//endPoint listaClientes
router.get("/listPedidos", async (req, res) => {
  // Obteniendo los parámetros de paginación de la consulta
  const limit = parseInt(req.query.limit) || 10; // Número de registros por página (predeterminado: 10)
  const offset = parseInt(req.query.offset) || 0; // Registro inicial (predeterminado: 0)

  try {
    // Consulta para obtener los registros con paginación
    const [result] = await pool.execute(
      `
      SELECT 
    c.Nombre AS NombreCliente, 
    ct.*, 
    IFNULL(SUM(dp.Subtotal), 0) AS TotalPedido 
FROM 
    pedidos ct 
JOIN 
    clientes c ON ct.IdCliente = c.IdCliente
LEFT JOIN 
    detallepedidos dp ON dp.IdPedido = ct.IdPedido
GROUP BY 
    ct.IdPedido, c.Nombre
ORDER BY 
    ct.FechaPedido DESC
LIMIT ${limit} OFFSET ${offset};

      `
    );

    // Consulta para obtener el total de registros sin paginación
    const [totalResult] = await pool.execute(`
      SELECT COUNT(*) AS Total
      FROM pedidos ct
      JOIN clientes c ON ct.IdCliente = c.IdCliente;
    `);

    // Total de registros
    const total = totalResult[0].Total;

    // Respuesta con datos y detalles de paginación
    res.json({
      data: result,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (err) {
    res.status(500).send("Error al obtener la lista de pedidos");
  }
});

router.put("/editPedido/:id", async (req, res) => {
  const { id } = req.params;
  const { IdCliente, FechaPedido } = req.body;
  let { fechaPedido } = req.body;

  // Convertir la fecha al formato yyyy-mm-dd si está en mm/dd/yyyy
  if (fechaPedido) {
    const [mes, dia, anio] = fechaPedido.split("/");
    fechaPedido = `${anio}-${mes}-${dia}`;
  }

  // Validación básica de los parámetros
  if (isNaN(Number(id))) {
    return res.status(400).send("El ID proporcionado no es válido");
  }
  if (!IdCliente || !FechaPedido) {
    return res.status(400).send("Todos los campos son obligatorios");
  }

  try {
    // Realizar la consulta para actualizar el pedido
    const [result] = await pool.execute(
      "UPDATE pedidos SET IdCliente = ?, FechaPedido = ? WHERE IdPedido = ?",
      [IdCliente, FechaPedido, id]
    );

    // Verificar si la actualización fue exitosa
    if (result.affectedRows > 0) {
      res.status(200).send("Pedido editado con éxito");
    } else {
      res.status(404).send(`Pedido con el ID ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al editar el pedido:", err);
    res.status(500).send("Error al editar el pedido");
  }
});
router.delete("/deletePedido/:id", async (req, res) => {
  const { id } = req.params;

  // Validar que el ID es un número
  if (isNaN(id)) {
    return res.status(400).send("El ID proporcionado no es válido");
  }

  try {
    // Realizar la consulta para eliminar el pedido
    const [result] = await pool.execute(
      "DELETE FROM pedidos WHERE IdPedido = ?",
      [id]
    );

    // Verificar si el pedido fue eliminado correctamente
    if (result.affectedRows > 0) {
      res.status(200).send(`El PEDIDO ${id} fue eliminado con éxito`);
    } else {
      res.status(404).send(`PEDIDO con el ID ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al eliminar PEDIDO:", err);
    res.status(500).send("Error al eliminar PEDIDO");
  }
});

router.post("/addPedido", async (req, res) => {
  const { IdCliente, FechaPedido } = req.body;

  // Verificar que los campos requeridos estén presentes
  if (!IdCliente || !FechaPedido) {
    return res.status(400).send("Todos los campos son necesarios");
  }

  try {
    // Realizar la consulta para insertar un nuevo pedido
    const [result] = await pool.execute(
      "INSERT INTO pedidos (IdCliente, FechaPedido) VALUES (?, ?)",
      [IdCliente, FechaPedido]
    );

    // Verificar si el pedido fue insertado correctamente
    if (result.affectedRows > 0) {
      res.status(201).send("Pedido añadido con éxito");
    } else {
      res.status(500).send("Error al añadir el pedido");
    }
  } catch (err) {
    console.error("Error al añadir pedido:", err);
    res.status(500).send("Error al añadir pedido");
  }
});
export default router;
