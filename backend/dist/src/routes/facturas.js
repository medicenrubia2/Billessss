"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Setup Multer para guardar imágenes localmente
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        const dir = path_1.default.join(__dirname, "../../uploads");
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (_req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, unique + ext);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Máx 10MB
    fileFilter: (_req, file, cb) => {
        if (/image\/(png|jpg|jpeg|webp)/.test(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Solo imágenes son permitidas"));
        }
    },
});
const router = (0, express_1.Router)();
// POST /api/facturas/subir
router.post("/subir", upload.single("factura"), (req, res) => {
    // req.file será tipado correctamente por Express + Multer
    if (!req.file) {
        return res.status(400).json({ error: "No se subió archivo" });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.status(201).json({ message: "Factura subida con éxito", filePath });
});
exports.default = router;
