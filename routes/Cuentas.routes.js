import { Router } from "express"; // Importa el Router de Express
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos

const router = Router(); // Crea una nueva instancia de Router

// Endpoint para listar cuentas con paginación
router.get("/listCuentas", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Límite predeterminado
  const offset = parseInt(req.query.offset) || 0; // Desplazamiento predeterminado

  try {
    // Consulta con paginación
    const [result] = await pool.query(
      `SELECT 
    c.Nombre AS NombreCliente, 
    c.IdCliente AS IdCliente,
    p.Abono, 
    p.Observaciones, 
    p.Pagado,
    IFNULL(SUM(dp.Subtotal), 0) AS TotalPedido, 
    p.FechaPedido, 
    p.IdPedido
FROM 
    pedidos p
JOIN 
    clientes c ON p.IdCliente = c.IdCliente
LEFT JOIN 
    detallepedidos dp ON dp.IdPedido = p.IdPedido
GROUP BY 
    p.IdPedido, c.Nombre, c.IdCliente, p.Abono, p.Observaciones, p.Pagado, p.FechaPedido
ORDER BY 
    p.FechaPedido ASC
LIMIT ? OFFSET ?;
`,
      [limit, offset]
    );

    // Consulta para calcular el total de registros
    const [totalResult] = await pool.query(
      `SELECT COUNT(*) AS Total
      FROM dedidos p
      JOIN clientes c ON p.IdCliente = c.IdCliente;`
    );

    const total = totalResult[0].Total;

    // Respuesta con datos y paginación
    res.json({
      data: result,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (err) {
    res.status(500).send("Error al procesar la solicitud");
  }
});

// Endpoint para actualizar Abono, Observaciones y Pagado en un pedido específico
router.put("/actualizarCuenta/:idPedido", async (req, res) => {
  const { idPedido } = req.params; // ID del pedido a actualizar
  const { Abono, Observaciones, Pagado } = req.body; // Valores a actualizar

  try {
    // Verifica si el pedido existe
    const [checkPedido] = await pool.query(
      `SELECT IdPedido FROM pedidos WHERE IdPedido = ?`,
      [idPedido]
    );

    if (checkPedido.length === 0) {
      return res.status(404).send("Pedido no encontrado");
    }

    // Realiza la actualización en la base de datos
    await pool.query(
      `UPDATE pedidos
      SET Abono = ?, Observaciones = ?, Pagado = ?
      WHERE IdPedido = ?`,
      [Abono, Observaciones, Pagado, idPedido]
    );

    res.status(200).send("Cuenta actualizada exitosamente");
  } catch (err) {
    res.status(500).send("Error al procesar la solicitud");
  }
});

export default router;
