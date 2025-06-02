// pages/api/submit-contact.js
import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  let db;
  try {
    db = await getDb(); // Intenta obtener la conexión a la DB
  } catch (dbError) {
    console.error('Error al conectar a la base de datos para submit-contact:', dbError);
    return res.status(500).json({ message: 'Error interno del servidor: Fallo en la conexión a la base de datos.' });
  }

  if (req.method === 'POST') {
    const { name, email, phone, message } = req.body;

    // Validación básica de campos obligatorios
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y Email son obligatorios.' });
    }

    try {
      const submissionDate = new Date().toISOString().split('T')[0]; // Formato AAAA-MM-DD
      const submissionTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }); // Formato HH:MM

      // Insertar los datos en la tabla 'submissions'
      const result = await db.run(
        'INSERT INTO submissions (name, email, phone, message, submissionDate, submissionTime) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, phone || null, message || null, submissionDate, submissionTime]
      );

      res.status(201).json({
        message: 'Datos guardados con éxito.',
        submissionId: result.lastID,
      });

    } catch (error) {
      console.error('Error al guardar los datos del formulario:', error);
      res.status(500).json({ message: 'Error interno del servidor al procesar su solicitud.' });
    }

  } else {
    // Si la solicitud no es POST, devuelve un error 405 (Método no permitido)
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} No Permitido`);
  }
}