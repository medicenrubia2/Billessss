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
const calculadora_1 = __importDefault(require("./routes/calculadora"));
const contacto_1 = __importDefault(require("./routes/contacto"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware de CORS
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Permitir múltiples orígenes
    credentials: true
}));
// Middleware para JSON
app.use(express_1.default.json());
// Servir archivos estáticos (facturas subidas)
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Rutas
app.use("/api/facturas", facturas_1.default);
app.use("/api/calculadora", calculadora_1.default);
app.use("/api/contacto", contacto_1.default);
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
