import { request, Router } from "express"; // Importa el Router de Express
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router

router.get("/listaClientesVista", async (req, res) => {
  const limit = parseInt(req.query.limit) || 14;
  const offset = parseInt(req.query.offset) || 0;

  try {
    // Obtener una conexión del pool
    const connection = await pool.getConnection();

    try {
      // Realizar la consulta principal con paginación
      const [rows] = await connection.query(
        `
        SELECT 
          c.Nombre AS NombreCliente,
          pd.IdPedido,
          pd.FechaPedido,
           SUM(dp.Subtotal) AS TotalPedido,
          pd.Abono,
          pd.Observaciones,
          pd.Pagado,
          GROUP_CONCAT(tp.Nombre SEPARATOR ', ') AS NombresPan,
          SUM(dp.Cantidad) AS TotalCantidad
        FROM 
          Pedidos pd
        JOIN 
          Clientes c ON pd.IdCliente = c.IdCliente
        LEFT JOIN 
          DetallePedidos dp ON pd.IdPedido = dp.IdPedido
        LEFT JOIN 
          TiposDePanes tp ON dp.IdTipoPan = tp.IdTipoPan
        GROUP BY 
          c.Nombre, pd.IdPedido, pd.FechaPedido, pd.TotalPedido, pd.Abono, pd.Observaciones, pd.Pagado
        ORDER BY 
          pd.FechaPedido ASC
        LIMIT ? OFFSET ?;
        `,
        [limit, offset]
      );

      // Consulta para calcular el total de registros
      const [totalRows] = await connection.query(
        `
        SELECT COUNT(DISTINCT pd.IdPedido) AS Total
        FROM Pedidos pd
        JOIN Clientes c ON pd.IdCliente = c.IdCliente
        LEFT JOIN DetallePedidos dp ON pd.IdPedido = dp.IdPedido
        LEFT JOIN TiposDePanes tp ON dp.IdTipoPan = tp.IdTipoPan;
        `
      );

      const total = totalRows[0].Total;

      // Respuesta con datos y paginación
      res.json({
        data: rows,
        pagination: { limit, offset, total },
      });
    } finally {
      // Liberar la conexión al pool
      connection.release();
    }
  } catch (err) {
    // console.error("Error al obtener la lista de Clientes:", err);
    res.status(500).send("Sin respuesta");
  }
});
router.get("/listaProduccion", async (req, res) => {
  const limit = parseInt(req.query.limit) || 14; // Límite predeterminado
  const offset = parseInt(req.query.offset) || 0; // Desplazamiento predeterminado

  try {
    // Obtener una conexión del pool
    const connection = await pool.getConnection();

    try {
      // Consulta con paginación
      const [rows] = await connection.query(
        `
        SELECT 
          tp.Nombre AS NombrePan, 
          p.Cantidad,
          p.Fecha,
          p.PanFaltante,
          p.PanSobrante,
          p.IdProduccion
        FROM 
          ProduccionDiaria p
        JOIN 
          TiposDePanes tp ON p.IdTipoPan = tp.IdTipoPan
        ORDER BY 
          p.Fecha ASC
        LIMIT ? OFFSET ?;
        `,
        [limit, offset]
      );

      // Consulta para calcular el total de registros (sin OFFSET ni LIMIT)
      const [totalRows] = await connection.query(
        `
        SELECT COUNT(*) AS Total
        FROM ProduccionDiaria p
        JOIN TiposDePanes tp ON p.IdTipoPan = tp.IdTipoPan;
        `
      );

      const total = totalRows[0].Total;

      // Respuesta con datos y paginación
      res.json({
        data: rows,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } finally {
      // Liberar la conexión al pool
      connection.release();
    }
  } catch (err) {
    // console.log("Error al obtener la lista de Producción", err);
    res.status(500).send("Sin respuesta");
  }
});
export default router;
