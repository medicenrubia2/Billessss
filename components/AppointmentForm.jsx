// components/AppointmentForm.jsx (o .tsx)
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper para formatear fechas a AAAA-MM-DD
const formatDateToISO = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper para formatear la hora (HH:mm)
const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    appointmentDateTime: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [bookedSlotsForSelectedDate, setBookedSlotsForSelectedDate] = useState([]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.appointmentDateTime) {
        setBookedSlotsForSelectedDate([]);
        setMessage(null);
        setMessageType('');
        return;
      }

      const selectedDate = formData.appointmentDateTime;
      const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

      if (dayOfWeek === 0) { // Si es domingo, no hay franjas disponibles y no se hace llamada a la API
        setBookedSlotsForSelectedDate([]);
        setMessage('No se realizan consultas los domingos. Por favor, elige otra fecha.');
        setMessageType('error');
        return;
      }

      const selectedDateISO = formatDateToISO(selectedDate);
      
      try {
        const res = await fetch(`/api/appointments?date=${selectedDateISO}`);
        const data = await res.json();
        
        if (res.ok) {
          setBookedSlotsForSelectedDate(data);
          setMessage(null); 
        } else {
          console.error('Error al obtener franjas reservadas:', data.message);
          setMessage(data.message || 'Error al cargar la disponibilidad de horas.');
          setMessageType('error');
        }
      } catch (error) {
        console.error('Fallo de red al obtener franjas reservadas:', error);
        setMessage('Fallo de conexión al cargar la disponibilidad.');
        setMessageType('error');
      }
    };
    fetchBookedSlots();
  }, [formData.appointmentDateTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateTimeChange = (dateTime) => {
    setFormData((prevData) => ({
      ...prevData,
      appointmentDateTime: dateTime,
    }));
  };

  // Filtra las fechas (deshabilita domingos)
  const isSelectableDate = (date) => {
    const day = date.getDay();
    return day !== 0; // 0 = Domingo
  };

  // Función para generar la lista de todas las horas que DEBEN ser excluidas
  const getExcludedTimes = () => {
    const excluded = [];
    const now = new Date();
    const currentSelectedDate = formData.appointmentDateTime;

    // Generar TODAS las horas posibles y luego excluir las que NO queremos
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) { // Asume intervalos de 30 minutos
            const timeCandidate = new Date();
            timeCandidate.setHours(h, m, 0, 0);

            // 1. Excluir horas fuera del rango 9:00 AM - 7:00 PM (19:00)
            if (h < 9 || h > 19 || (h === 19 && m > 0)) { // 19:00 es 7 PM, 19:30 ya está fuera
                excluded.push(timeCandidate);
                continue; // No necesitamos más cheques para esta hora si ya está fuera de rango
            }

            // 2. Excluir horas pasadas si la fecha seleccionada es hoy
            if (currentSelectedDate && formatDateToISO(currentSelectedDate) === formatDateToISO(now)) {
                if (timeCandidate.getTime() < now.getTime()) {
                    excluded.push(timeCandidate);
                    continue;
                }
            }

            // 3. Excluir horas ya reservadas por la API
            const formattedTimeCandidate = formatTime(timeCandidate);
            if (bookedSlotsForSelectedDate.includes(formattedTimeCandidate)) {
                excluded.push(timeCandidate);
                continue;
            }
        }
    }
    
    // Eliminar duplicados para evitar problemas
    const uniqueExcludedTimes = Array.from(new Set(excluded.map(d => d.getTime())))
                                    .map(timeInMillis => new Date(timeInMillis));
    return uniqueExcludedTimes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType('');

    if (!formData.appointmentDateTime) {
        setMessage('Por favor, selecciona una fecha y hora para tu consulta.');
        setMessageType('error');
        setLoading(false);
        return;
    }

    const dataToSend = {
      ...formData,
      appointmentDate: formatDateToISO(formData.appointmentDateTime),
      appointmentTime: formatTime(formData.appointmentDateTime),
    };
    delete dataToSend.appointmentDateTime;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Cita agendada con éxito. Recibirás una confirmación por email.');
        setMessageType('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          appointmentDateTime: null,
          message: '',
        });
      } else {
        setMessage(data.message || 'Error al agendar la cita. Por favor, inténtalo de nuevo.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Fallo de red al agendar la cita:', error);
      setMessage('Fallo de conexión al agendar la cita.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // `minTime` y `maxTime` aquí se usan para ayudar a `DatePicker` a renderizar un rango más acotado.
  // Sin embargo, `excludeTimes` será el que finalmente filtre lo que se ve.
  const minTimeForPicker = new Date();
  minTimeForPicker.setHours(9, 0, 0, 0); 

  const maxTimeForPicker = new Date();
  maxTimeForPicker.setHours(19, 0, 0, 0); // 7:00 PM (19:00)

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Agenda Tu Consulta</h2>

      {message && (
        <div className={`p-4 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Nombre Completo:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
            Teléfono (opcional):
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="appointmentDateTime" className="block text-gray-700 text-sm font-bold mb-2">
            Fecha y Hora de la Consulta:
          </label>
          <DatePicker
            selected={formData.appointmentDateTime}
            onChange={handleDateTimeChange}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            timeFormat="HH:mm"
            timeIntervals={30} // Intervalos de 30 minutos
            minDate={new Date()} // No permite fechas pasadas
            filterDate={isSelectableDate} // Deshabilita domingos
            
            // Aunque `excludeTimes` hará la mayor parte del trabajo, mantener estos límites ayuda
            // al DatePicker a saber qué rango inicial considerar.
            minTime={minTimeForPicker} 
            maxTime={maxTimeForPicker} 
            
            // `excludeTimes` ahora es el filtro principal para que no se muestren las opciones no deseadas.
            excludeTimes={getExcludedTimes()} 
            placeholderText="Selecciona fecha y hora"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
            Tu Mensaje (opcional):
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading || !formData.appointmentDateTime}
        >
          {loading ? 'Agendando...' : 'Confirmar Cita'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;