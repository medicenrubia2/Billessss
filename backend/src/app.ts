import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import facturasRoutes from "./routes/facturas";

dotenv.config();

const app = express();

// Middleware de CORS
app.use(cors({
  origin: "http://localhost:3000", // Cambia a tu frontend real en producción
  credentials: true
}));

// Middleware para JSON (por si agregas endpoints que no sean multipart)
app.use(express.json());

// Servir archivos estáticos (facturas subidas)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas de facturas
app.use("/api/facturas", facturasRoutes);

// Ruta test principal
app.get("/", (_req, res) => {
  res.json({ message: "API ImpuestosRD backend ready 🚀" });
});

// Arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});
