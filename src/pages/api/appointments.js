// pages/api/appointments.js
import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  let db;
  try {
    db = await getDb();
  } catch (dbError) {
    console.error('Error al conectar a la base de datos SQLite:', dbError);
    return res.status(500).json({ message: 'Error interno del servidor: Fallo en la conexión a la base de datos.' });
  }

  if (req.method === 'POST') {
    const { name, email, phone, appointmentDate, appointmentTime, message } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!name || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Faltan campos obligatorios (nombre, email, fecha, hora).' });
    }

    try {
      // Como ya no hay calendario, la lógica de verificación de disponibilidad
      // se simplifica. Solo insertamos la cita.
      // Si la disponibilidad se maneja externamente, este endpoint solo registra.
      const result = await db.run(
        'INSERT INTO appointments (name, email, phone, appointmentDate, appointmentTime, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          name,
          email,
          phone,
          appointmentDate,
          appointmentTime,
          message,
          'scheduled',
          new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]
      );

      res.status(201).json({
        message: 'Cita agendada con éxito. Recibirás una confirmación por email.',
        appointmentId: result.lastID,
      });

    } catch (error) {
      console.error('Error al agendar la cita:', error);
      res.status(500).json({ message: 'Error interno del servidor al procesar tu solicitud.' });
    }

  } else if (req.method === 'GET') {
    try {
      // Si ya no se usa un calendario para seleccionar franjas, este GET podría
      // usarse para listar todas las citas o para propósitos administrativos.
      // Por ahora, lo dejaremos como estaba, consultando por fecha si se le pasa.
      const { date } = req.query;

      let appointments;
      if (date) {
        // Obtener citas programadas para una fecha específica
        appointments = await db.all(
          'SELECT * FROM appointments WHERE appointmentDate = ? AND status != ?',
          [date, 'cancelled']
        );
      } else {
        // Obtener todas las citas (cuidado con esto en producción sin paginación)
        appointments = await db.all('SELECT * FROM appointments WHERE status != ?', ['cancelled']);
      }
      
      res.status(200).json(appointments);

    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ message: 'Error interno del servidor al obtener las citas.' });
    }

  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}