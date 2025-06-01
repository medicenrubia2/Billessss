// pages/api/appointments.js
import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  let db;
  try {
    db = await getDb(); // Intenta obtener la conexión a la DB
  } catch (dbError) {
    console.error('Error al conectar a la base de datos:', dbError);
    // Si hay un error de conexión, respondemos con 500
    return res.status(500).json({ message: 'Error interno del servidor: Fallo en la conexión a la base de datos.' });
  }

  if (req.method === 'POST') {
    const { name, email, phone, appointmentDate, appointmentTime, message } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!name || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Faltan campos obligatorios (nombre, email, fecha, hora).' });
    }

    try {
      // 1. Verificar disponibilidad de la franja horaria
      // MySQL usa '?' para los parámetros, y estos se pasan como un array.
      const existingAppointment = await db.get(
        'SELECT id FROM appointments WHERE appointmentDate = ? AND appointmentTime = ? AND status != ?',
        [appointmentDate, appointmentTime, 'cancelled'] // ¡Parámetros en un array!
      );

      if (existingAppointment) {
        return res.status(409).json({ message: 'Esa franja horaria ya está reservada. Por favor, elige otra.' });
      }

      // 2. Insertar la nueva cita en la base de datos MySQL
      const result = await db.run(
        'INSERT INTO appointments (name, email, phone, appointmentDate, appointmentTime, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          name,
          email,
          phone,
          appointmentDate,
          appointmentTime,
          message,
          'scheduled', // Establece el estado inicial de la cita
          new Date().toISOString().slice(0, 19).replace('T', ' ') // Formato DATETIME para MySQL 'YYYY-MM-DD HH:MM:SS'
        ] // ¡Parámetros en un array!
      );

      res.status(201).json({
        message: 'Cita agendada con éxito. Recibirás una confirmación por email.',
        appointmentId: result.lastID, // MySQL devuelve el ID insertado como 'insertId'
      });

    } catch (error) {
      console.error('Error al agendar la cita:', error);
      res.status(500).json({ message: 'Error interno del servidor al procesar tu solicitud.' });
    }

  } else if (req.method === 'GET') {
    try {
      const { date } = req.query;

      // Se requiere una fecha para obtener la disponibilidad
      if (!date) {
        return res.status(400).json({ message: 'Se requiere una fecha para consultar la disponibilidad de citas.' });
      }

      // Obtener las horas de las citas programadas para la fecha específica
      const appointments = await db.all(
        'SELECT appointmentTime FROM appointments WHERE appointmentDate = ? AND status != ?',
        [date, 'cancelled'] // ¡Parámetros en un array!
      );
      
      const bookedTimes = appointments.map(appt => appt.appointmentTime);
      
      res.status(200).json(bookedTimes);

    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ message: 'Error interno del servidor al obtener la disponibilidad.' });
    }

  } else {
    // Si el método HTTP no es POST ni GET, devuelve un 405 Method Not Allowed
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}