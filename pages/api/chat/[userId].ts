// pages/api/chat/[userId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
// Importa connectDB y la instancia de sequelize
import { connectDB } from '../../../src/config/sequelize';
import sequelize from '../../../src/config/sequelize'; // Importa la instancia de sequelize
// Importa el modelo Conversation y Op de sequelize
import { Conversation } from '../../../src/models/Conversation';
import { Op } from 'sequelize'; // <--- ¡CORRECCIÓN CLAVE! Importa Op directamente de 'sequelize'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Asegúrate de que solo se acepten peticiones GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.query;

  // Valida que el userId exista y sea una cadena de texto
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Conecta a la base de datos (se recomienda llamar esto aquí para cada petición API)
    await connectDB();

    let conversation: Conversation | null = null; // <--- CORRECCIÓN: Usamos 'Conversation' para el tipo

    // Busca una conversación existente donde 'userId' y 'admin' sean participantes.
    // Asumimos que 'participants' es un ARRAY de texto o JSONB en PostgreSQL
    conversation = await Conversation.findOne({
      where: { // <--- CORRECCIÓN: Solo una propiedad 'where'
        participants: {
          [Op.contains]: [userId, 'admin'] // <--- CORRECCIÓN: Usamos Op directamente
        }
      }
    });

    if (!conversation) {
      // Si no existe, crea una nueva conversación con ambos participantes
      conversation = await Conversation.create({
        participants: [userId, 'admin'], // 'admin' es un ID de placeholder para el agente
      });
      console.log(`Nueva conversación creada para ${userId}: ${conversation.toJSON()}`);
    } else {
      console.log(`Conversación existente encontrada para ${userId}: ${conversation.toJSON()}`);
    }

    // Devuelve el ID de la conversación
    res.status(200).json({ conversationId: conversation.id }); // Usamos .id de Sequelize

  } catch (error: any) {
    console.error('Error en la ruta API /api/chat/[userId]:', error);
    // Asegúrate de enviar un error en un formato JSON adecuado
    res.status(500).json({ message: 'Internal Server Error', error: error.message || 'Unknown error' });
  }
}