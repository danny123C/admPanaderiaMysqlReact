import express from "express";
import cors from "cors";

// Importar rutas
import tiposDePanesRoutes from "../routes/TiposPanes.routes.js";
import produccionDiariaRoutes from "../routes/ProduccionDiaria.routes.js";
import clientesRoutes from "../routes/Clientes.routes.js";
import PedidosRoutes from "../routes/Pedidos.routes.js";
import detallePedido from "../routes/DetallePedidos.routes.js";
import IndexClientes from "../routes/Index.routes.js";
import Cuentas from "../routes/Cuentas.routes.js";
import Login from "../routes/login.routes.js";
import Barchart from "../routes/BarChart.routes.js";
import Materiales from "../routes/Materiales.routes.js";

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: process.env.URLL_FRONT || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware para manejo de datos JSON
app.use(express.json());

// Log para depuración
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas API
app.use("/api", tiposDePanesRoutes);
app.use("/api", produccionDiariaRoutes);
app.use("/api", clientesRoutes);
app.use("/api", PedidosRoutes);
app.use("/api", detallePedido);
app.use("/api", IndexClientes);
app.use("/api", Cuentas);
app.use("/api", Login);
app.use("/api", Barchart);
app.use("/api", Materiales);

// Configuración del puerto
app.set("port", process.env.PORT || 3000);

// Iniciar el servidor
app.listen(app.get("port"), () => {
  console.log(`Servidor escuchando en el puerto ${app.get("port")}`);
  console.log(`API disponible en: http://localhost:${app.get("port")}/api`);
});
