"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const supabaseClient_1 = require("../utils/supabaseClient");
// Setup Multer para guardar archivos localmente temporalmente
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
    limits: { fileSize: 50 * 1024 * 1024 }, // Máx 50MB
    fileFilter: (_req, file, cb) => {
        // Permite imágenes y PDFs
        if (/image\/(png|jpg|jpeg|webp)/.test(file.mimetype) || file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error("Solo imágenes y PDFs son permitidos"));
        }
    },
});
const router = (0, express_1.Router)();
// POST /api/facturas/subir
router.post("/subir", upload.single("factura"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se subió archivo" });
        }
        // Leer el archivo
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        const fileName = `${Date.now()}-${req.file.originalname}`;
        // Subir a Supabase Storage
        const { data, error } = await supabaseClient_1.supabase.storage
            .from('facturas')
            .upload(`documents/${fileName}`, fileBuffer, {
            contentType: req.file.mimetype,
        });
        if (error) {
            throw error;
        }
        // Crear entrada en la base de datos
        const { data: facturaData, error: dbError } = await supabaseClient_1.supabase
            .from('facturas')
            .insert([{
                nombre_archivo: req.file.originalname,
                tipo_archivo: req.file.mimetype,
                tamano_archivo: req.file.size,
                ruta_storage: data.path,
                subido_en: new Date().toISOString()
            }])
            .select();
        if (dbError) {
            throw dbError;
        }
        // Limpiar archivo temporal
        fs_1.default.unlinkSync(req.file.path);
        res.status(201).json({
            message: "Factura subida con éxito",
            factura: facturaData[0],
            storagePath: data.path
        });
    }
    catch (error) {
        console.error('Error al subir factura:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// GET /api/facturas - Obtener todas las facturas
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabaseClient_1.supabase
            .from('facturas')
            .select('*')
            .order('subido_en', { ascending: false });
        if (error) {
            throw error;
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// GET /api/facturas/:id/download - Descargar factura
router.get("/:id/download", async (req, res) => {
    try {
        const { id } = req.params;
        // Obtener información de la factura
        const { data: factura, error: facturaError } = await supabaseClient_1.supabase
            .from('facturas')
            .select('*')
            .eq('id', id)
            .single();
        if (facturaError || !factura) {
            return res.status(404).json({ error: "Factura no encontrada" });
        }
        // Obtener URL firmada para descargar
        const { data, error } = await supabaseClient_1.supabase.storage
            .from('facturas')
            .createSignedUrl(factura.ruta_storage, 60); // 60 segundos
        if (error) {
            throw error;
        }
        res.json({ downloadUrl: data.signedUrl });
    }
    catch (error) {
        console.error('Error al descargar factura:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.default = router;
