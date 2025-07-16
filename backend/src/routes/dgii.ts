import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

// Interface para datos de RNC
interface RNCData {
  rnc: string;
  razon_social: string;
  nombre_comercial: string;
  categoria: string;
  regimen: string;
  estado: string;
  actividad_economica: string;
  direccion: string;
  telefono: string;
  email: string;
  fecha_constitucion: string;
  fecha_inicio_operaciones: string;
  ultima_actualizacion: string;
}

// Simulación de consulta RNC (reemplazar con API real de DGII)
const consultarRNCSimulado = async (rnc: string): Promise<RNCData | null> => {
  // Simulación de datos
  const simulatedData: Record<string, RNCData> = {
    "131793916": {
      rnc: "131-79391-6",
      razon_social: "EMPRESA EJEMPLO SRL",
      nombre_comercial: "EJEMPLO",
      categoria: "CONTRIBUYENTE NORMAL",
      regimen: "ORDINARIO",
      estado: "ACTIVO",
      actividad_economica: "COMERCIO AL POR MENOR",
      direccion: "CALLE EJEMPLO #123, SANTO DOMINGO",
      telefono: "809-555-0123",
      email: "info@ejemplo.com",
      fecha_constitucion: "2020-01-15",
      fecha_inicio_operaciones: "2020-02-01",
      ultima_actualizacion: new Date().toISOString()
    },
    "101234567": {
      rnc: "101-23456-7",
      razon_social: "TECNOLOGIA AVANZADA SA",
      nombre_comercial: "TECNO AVANZADA",
      categoria: "GRAN CONTRIBUYENTE",
      regimen: "ESPECIAL",
      estado: "ACTIVO",
      actividad_economica: "DESARROLLO DE SOFTWARE",
      direccion: "AV. TECNOLOGIA #456, SANTO DOMINGO",
      telefono: "809-555-0456",
      email: "contacto@tecnoavanzada.com",
      fecha_constitucion: "2018-05-10",
      fecha_inicio_operaciones: "2018-06-01",
      ultima_actualizacion: new Date().toISOString()
    }
  };

  const cleanRNC = rnc.replace(/[-\s]/g, '');
  return simulatedData[cleanRNC] || null;
};

// Validar RNC dominicano
const validarRNC = (rnc: string): boolean => {
  const cleanRNC = rnc.replace(/[-\s]/g, '');
  
  if (!/^\d{9}$/.test(cleanRNC)) {
    return false;
  }
  
  const digits = cleanRNC.split('').map(Number);
  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === digits[8];
};

// POST /api/dgii/consultar-rnc
router.post("/consultar-rnc", async (req: Request, res: Response) => {
  try {
    const { rnc } = req.body;

    if (!rnc) {
      return res.status(400).json({ error: "RNC es requerido" });
    }

    // Validar formato de RNC
    if (!validarRNC(rnc)) {
      return res.status(400).json({ error: "RNC inválido" });
    }

    // Consultar RNC
    const data = await consultarRNCSimulado(rnc);

    if (!data) {
      return res.status(404).json({ error: "RNC no encontrado" });
    }

    res.json({
      success: true,
      data: data,
      mensaje: "RNC consultado exitosamente"
    });

  } catch (error) {
    console.error('Error al consultar RNC:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/dgii/validar-rnc/:rnc
router.get("/validar-rnc/:rnc", (req: Request, res: Response) => {
  try {
    const { rnc } = req.params;

    const esValido = validarRNC(rnc);

    res.json({
      rnc: rnc,
      valido: esValido,
      mensaje: esValido ? "RNC válido" : "RNC inválido"
    });

  } catch (error) {
    console.error('Error al validar RNC:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/dgii/categorias
router.get("/categorias", (req: Request, res: Response) => {
  const categorias = [
    {
      id: 'normal',
      nombre: 'Contribuyente Normal',
      descripcion: 'Contribuyentes con ingresos anuales menores a RD$7,000,000'
    },
    {
      id: 'gran_contribuyente',
      nombre: 'Gran Contribuyente',
      descripcion: 'Contribuyentes con ingresos anuales mayores a RD$7,000,000'
    },
    {
      id: 'regimen_simplificado',
      nombre: 'Régimen Simplificado',
      descripcion: 'Pequeños contribuyentes con ingresos anuales hasta RD$500,000'
    },
    {
      id: 'no_residente',
      nombre: 'No Residente',
      descripcion: 'Contribuyentes no residentes en territorio dominicano'
    }
  ];

  res.json(categorias);
});

// GET /api/dgii/regimenes
router.get("/regimenes", (req: Request, res: Response) => {
  const regimenes = [
    {
      id: 'ordinario',
      nombre: 'Régimen Ordinario',
      descripcion: 'Régimen tributario general'
    },
    {
      id: 'especial',
      nombre: 'Régimen Especial',
      descripcion: 'Régimen para grandes contribuyentes'
    },
    {
      id: 'simplificado',
      nombre: 'Régimen Simplificado',
      descripcion: 'Régimen para pequeños contribuyentes'
    }
  ];

  res.json(regimenes);
});

export default router;