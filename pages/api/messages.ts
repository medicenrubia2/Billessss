// C:\Users\martin\Desktop\aplicaciones\rhai\my-rhai-landing\pages\api\messages.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'; // ESTO ES PARA PRISMA

// Instancia de Prisma
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Maneja solo peticiones POST para guardar mensajes
  if (req.method === 'POST') {
    const { conversation, sender, content, timestamp } = req.body;

    // Validaciones básicas de los datos recibidos
    if (!conversation || !sender || !content || !timestamp) {
      console.error('API Next.js: Error - Faltan datos en el mensaje.', { conversation, sender, content, timestamp });
      return res.status(400).json({ error: 'Faltan datos requeridos para el mensaje.' });
    }

    try {
      // --- CÓDIGO PARA GUARDAR EL MENSAJE CON PRISMA ---
      const newMessage = await prisma.message.create({
        data: {
          conversationId: conversation,
          senderId: sender,
          content: content,
          timestamp: new Date(timestamp), // Prisma espera un objeto Date
        },
      });
      // --------------------------------------------------

      console.log('API Next.js: Mensaje recibido y guardado exitosamente con Prisma:', newMessage); // Log más específico
      return res.status(201).json(newMessage); // Devuelve el mensaje guardado (con su ID de la DB)
    } catch (error: any) {
      console.error('API Next.js: Error al intentar guardar el mensaje en la base de datos con Prisma:', error.message || error); // Log más específico
      return res.status(500).json({ error: 'Error interno del servidor al guardar el mensaje.' });
    }
  } else {
    // Si no es un método POST, devuelve un 405 (Método No Permitido)
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} No Permitido`);
  }
}