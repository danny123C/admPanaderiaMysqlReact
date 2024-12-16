import { Router } from "express";
import pool from "../src/database.js"; // Importa el pool de conexiones a la base de datos

const router = Router(); // Crea una nueva instancia de Router

// Ruta para obtener los pedidos por mes (para gráfico de barras)
router.get("/listaPedidosPorMes", async (req, res) => {
  try {
    const [result] = await pool.query(`
    SELECT 
    YEAR(p.FechaPedido) AS Ano,
    MONTH(p.FechaPedido) AS Mes,
    COUNT(p.IdPedido) AS TotalPedidos,
    SUM(dp.Subtotal) AS MontoTotal
FROM 
    pedidos p
JOIN 
    detallepedidos dp ON p.IdPedido = dp.IdPedido
WHERE 
    p.FechaPedido IS NOT NULL
GROUP BY 
    YEAR(p.FechaPedido), MONTH(p.FechaPedido)
ORDER BY 
    Ano, Mes;

    `);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los pedidos por mes." });
  }
});

// Ruta para obtener la producción por mes (para gráfico de barras)
router.get("/listaProduccionPorMes", async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT 
          YEAR(p.Fecha) AS Ano,
          MONTH(p.Fecha) AS Mes,
          tp.Nombre AS NombrePan,
          SUM(p.Cantidad) AS CantidadPorTipoPan,
          SUM(p.PanFaltante) AS PanFaltante,
          SUM(p.PanSobrante) AS PanSobrante
      FROM 
          producciondiaria p
      JOIN 
          tiposdepanes tp ON p.IdTipoPan = tp.IdTipoPan
      WHERE 
          p.Fecha IS NOT NULL
      GROUP BY 
          YEAR(p.Fecha), MONTH(p.Fecha), tp.Nombre
      ORDER BY 
          Ano, Mes;
    `);

    // Agrupando los datos obtenidos de la consulta
    const datosAgrupados = result.reduce((acc, curr) => {
      const {
        Ano,
        Mes,
        NombrePan,
        CantidadPorTipoPan,
        PanFaltante,
        PanSobrante,
      } = curr;
      const key = `${Ano}-${Mes}`;

      if (!acc[key]) {
        acc[key] = {
          Ano,
          Mes,
          NombrePan: {},
          CantidadTotalMes: 0,
          PanFaltante: 0,
          PanSobrante: 0,
        };
      }

      acc[key].NombrePan[NombrePan] = CantidadPorTipoPan;
      acc[key].CantidadTotalMes += CantidadPorTipoPan;
      acc[key].PanFaltante += PanFaltante;
      acc[key].PanSobrante += PanSobrante;

      return acc;
    }, {});

    // Enviar los datos agrupados como respuesta JSON
    res.json(Object.values(datosAgrupados));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la producción por mes." });
  }
});

export default router;
