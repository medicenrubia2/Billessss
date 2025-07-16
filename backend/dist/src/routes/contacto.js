"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../utils/supabaseClient");
const router = (0, express_1.Router)();
// POST /api/contacto/enviar
router.post("/enviar", async (req, res) => {
    try {
        const { nombre, email, telefono, mensaje } = req.body;
        // Validar campos requeridos
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({
                error: "Nombre, email y mensaje son requeridos"
            });
        }
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Formato de email inválido" });
        }
        // Guardar en Supabase
        const { data, error } = await supabaseClient_1.supabase
            .from('contactos')
            .insert([{
                nombre,
                email,
                telefono: telefono || null,
                mensaje,
                fecha_creacion: new Date().toISOString()
            }])
            .select();
        if (error) {
            throw error;
        }
        // Aquí podrías agregar lógica para enviar email de notificación
        // Por ejemplo usando SendGrid, Nodemailer, etc.
        res.status(201).json({
            message: "Mensaje enviado exitosamente",
            contacto: data[0]
        });
    }
    catch (error) {
        console.error('Error al enviar contacto:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// GET /api/contacto - Obtener todos los contactos (admin)
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabaseClient_1.supabase
            .from('contactos')
            .select('*')
            .order('fecha_creacion', { ascending: false });
        if (error) {
            throw error;
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error al obtener contactos:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// GET /api/contacto/:id - Obtener contacto específico
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseClient_1.supabase
            .from('contactos')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            return res.status(404).json({ error: "Contacto no encontrado" });
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error al obtener contacto:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.default = router;
