import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

// Setup Multer para guardar imágenes localmente
const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const dir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Máx 10MB
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (/image\/(png|jpg|jpeg|webp)/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo imágenes son permitidas"));
    }
  },
});

const router = Router();

// POST /api/facturas/subir
router.post("/subir", upload.single("factura"), (req: Request, res: Response) => {
  // req.file será tipado correctamente por Express + Multer
  if (!req.file) {
    return res.status(400).json({ error: "No se subió archivo" });
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.status(201).json({ message: "Factura subida con éxito", filePath });
});

export default router;
