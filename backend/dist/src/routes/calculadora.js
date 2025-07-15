"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// POST /api/calculadora/calcular
router.post("/calcular", (req, res) => {
    try {
        const { subtotal, tipoCalculo, aplicarITBIS = true, aplicarIVA = false, aplicarRetencion = false, porcentajeITBIS = 18, porcentajeIVA = 18, porcentajeRetencion = 10 } = req.body;
        if (!subtotal || typeof subtotal !== 'number') {
            return res.status(400).json({ error: "Subtotal requerido y debe ser un número" });
        }
        const calculo = {
            subtotal,
            impuestos: {
                itbis: 0,
                iva: 0,
                retencion: 0
            },
            total: subtotal
        };
        // Calcular ITBIS (Impuesto sobre Transferencias de Bienes Industrializados y Servicios)
        if (aplicarITBIS) {
            calculo.impuestos.itbis = subtotal * (porcentajeITBIS / 100);
        }
        // Calcular IVA (si aplica)
        if (aplicarIVA) {
            calculo.impuestos.iva = subtotal * (porcentajeIVA / 100);
        }
        // Calcular Retención (si aplica)
        if (aplicarRetencion) {
            calculo.impuestos.retencion = subtotal * (porcentajeRetencion / 100);
        }
        // Calcular total
        calculo.total = subtotal + calculo.impuestos.itbis + (calculo.impuestos.iva || 0) - (calculo.impuestos.retencion || 0);
        res.json({
            calculo,
            detalles: {
                subtotal: subtotal.toFixed(2),
                itbis: calculo.impuestos.itbis.toFixed(2),
                iva: calculo.impuestos.iva?.toFixed(2) || "0.00",
                retencion: calculo.impuestos.retencion?.toFixed(2) || "0.00",
                total: calculo.total.toFixed(2)
            }
        });
    }
    catch (error) {
        console.error('Error en cálculo tributario:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// GET /api/calculadora/tipos - Obtener tipos de cálculos disponibles
router.get("/tipos", (req, res) => {
    const tiposCalculo = [
        {
            id: 'itbis',
            nombre: 'ITBIS',
            descripcion: 'Impuesto sobre Transferencias de Bienes Industrializados y Servicios',
            porcentaje: 18
        },
        {
            id: 'iva',
            nombre: 'IVA',
            descripcion: 'Impuesto al Valor Agregado',
            porcentaje: 18
        },
        {
            id: 'retencion',
            nombre: 'Retención',
            descripcion: 'Retención en la fuente',
            porcentaje: 10
        }
    ];
    res.json(tiposCalculo);
});
exports.default = router;
