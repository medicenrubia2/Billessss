"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const facturas_1 = __importDefault(require("./routes/facturas"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware de CORS
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // Cambia a tu frontend real en producción
    credentials: true
}));
// Middleware para JSON (por si agregas endpoints que no sean multipart)
app.use(express_1.default.json());
// Servir archivos estáticos (facturas subidas)
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Rutas de facturas
app.use("/api/facturas", facturas_1.default);
// Ruta test principal
app.get("/", (_req, res) => {
    res.json({ message: "API ImpuestosRD backend ready 🚀" });
});
// Arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor backend en http://localhost:${PORT}`);
});
