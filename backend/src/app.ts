import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import facturasRoutes from "./routes/facturas";
import calculadoraRoutes from "./routes/calculadora";

dotenv.config();

const app = express();

// Middleware de CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Permitir múltiples orígenes
  credentials: true
}));

// Middleware para JSON
app.use(express.json());

// Servir archivos estáticos (facturas subidas)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/facturas", facturasRoutes);
app.use("/api/calculadora", calculadoraRoutes);

// Ruta test principal
app.get("/", (_req, res) => {
  res.json({ message: "API ImpuestosRD backend ready 🚀" });
});

// Ruta de salud
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});
