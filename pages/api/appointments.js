// pages/api/appointments.js
import { getDb } from '../../lib/db'; // Ajusta la ruta si es necesario

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === 'POST') {
    const { name, email, phone, appointmentDate, appointmentTime, message } = req.body;

    if (!name || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    try {
      // 1. Verificar disponibilidad
      const existingAppointment = await db.get(
        'SELECT * FROM appointments WHERE appointmentDate = ? AND appointmentTime = ? AND status != ?',
        appointmentDate,
        appointmentTime,
        'cancelled' // No consideramos citas canceladas como conflictos
      );

      if (existingAppointment) {
        return res.status(409).json({ message: 'Esa franja horaria ya está reservada. Por favor, elige otra.' });
      }

      // 2. Insertar la nueva cita
      const result = await db.run(
        'INSERT INTO appointments (name, email, phone, appointmentDate, appointmentTime, message) VALUES (?, ?, ?, ?, ?, ?)',
        name,
        email,
        phone,
        appointmentDate,
        appointmentTime,
        message
      );

      // Aquí podrías enviar un email de confirmación (usando Nodemailer, SendGrid, Resend, etc.)
      // console.log(`Email de confirmación enviado a ${email}`);

      res.status(201).json({
        message: 'Cita agendada con éxito',
        appointmentId: result.lastID,
      });

    } catch (error) {
      console.error('Error al agendar la cita:', error);
      res.status(500).json({ message: 'Error interno del servidor al agendar la cita.' });
    }
  } else if (req.method === 'GET') {
    // Opcional: Endpoint para obtener franjas horarias disponibles o citas existentes
    try {
      const { date } = req.query;
      let appointments;
      if (date) {
        // Obtener citas para una fecha específica
        appointments = await db.all(
          'SELECT appointmentTime FROM appointments WHERE appointmentDate = ? AND status != ?',
          date,
          'cancelled'
        );
      } else {
        // Obtener todas las citas (posiblemente con paginación/filtros para producción)
        appointments = await db.all('SELECT * FROM appointments');
      }
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ message: 'Error interno del servidor al obtener citas.' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}