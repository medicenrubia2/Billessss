// components/AppointmentForm.jsx (o .tsx)
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker'; // Importa DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Asegúrate de que los estilos estén importados aquí o en _app.tsx

// Helper para formatear fechas a AAAA-MM-DD (útil para la API)
const formatDateToISO = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Los meses son de 0-11
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper para formatear la hora (HH:mm) para la API y la visualización
const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // appointmentDateTime será un objeto Date que contendrá fecha y hora
    appointmentDateTime: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  // Estado para almacenar las horas ya reservadas para el día seleccionado
  const [bookedSlotsForSelectedDate, setBookedSlotsForSelectedDate] = useState([]);

  // Efecto para cargar las franjas horarias reservadas cuando la fecha seleccionada cambia
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (formData.appointmentDateTime) {
        const selectedDateISO = formatDateToISO(formData.appointmentDateTime);

        // Si es domingo, no hacemos la llamada API ni generamos franjas
        if (formData.appointmentDateTime.getDay() === 0) {
          setBookedSlotsForSelectedDate([]);
          setMessage('No se realizan consultas los domingos. Por favor, elige otra fecha.');
          setMessageType('error');
          return;
        }

        try {
          const res = await fetch(`/api/appointments?date=${selectedDateISO}`);
          const data = await res.json();
          if (res.ok) {
            setBookedSlotsForSelectedDate(data.map(slot => slot.appointmentTime));
            setMessage(null); // Limpiar mensajes de error previos
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
      } else {
        setBookedSlotsForSelectedDate([]);
        setMessage(null); // Limpiar mensajes
      }
    };
    fetchBookedSlots();
  }, [formData.appointmentDateTime]); // Dependencia: se ejecuta cuando 'appointmentDateTime' cambia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Maneja el cambio del DatePicker (fecha y hora)
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

  // Filtra las horas disponibles
  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = formData.appointmentDateTime;

    // Solo filtrar si la fecha seleccionada es HOY
    if (selectedDate && formatDateToISO(selectedDate) === formatDateToISO(currentDate)) {
      return currentDate.getTime() < time.getTime();
    }
    return true; // No filtrar si no es hoy
  };

  // Define las horas disponibles según el día de la semana
  // Esta función no es directamente usada por DatePicker.
  // La lógica de minTime/maxTime/excludeTimes dentro del DatePicker maneja esto.
  const getAvailableHours = (date) => {
    if (!date) return [];

    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    let minHour, maxHour;

    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lunes a Viernes
      minHour = 9;  // 9:00 AM
      maxHour = 19; // 7:00 PM (19:00h)
    } else if (dayOfWeek === 6) { // Sábado
      minHour = 9;  // 9:00 AM
      maxHour = 16; // 4:00 PM (16:00h)
    } else { // Domingo
      return []; // No hay horas disponibles
    }

    const hours = [];
    for (let h = minHour; h <= maxHour; h++) {
      hours.push(h);
    }
    return hours;
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

    // Prepara los datos para la API
    const dataToSend = {
      ...formData,
      appointmentDate: formatDateToISO(formData.appointmentDateTime), // 'YYYY-MM-DD'
      appointmentTime: formatTime(formData.appointmentDateTime),      // 'HH:mm'
    };
    // Eliminar la propiedad original para no enviarla doble
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
        // Resetear el formulario
        setFormData({
          name: '',
          email: '',
          phone: '',
          appointmentDateTime: null, // Resetear el objeto Date
          message: '',
        });
        // Actualizar la lista de horas reservadas para reflejar la nueva cita
        // Es mejor forzar un re-fetch de las citas para la fecha actual
        // Aquí simulamos añadirla, pero un re-fetch sería más robusto
        if (formData.appointmentDateTime) { // Solo si había una fecha seleccionada
            const newBookedTime = formatTime(formData.appointmentDateTime);
            setBookedSlotsForSelectedDate(prev => [...prev, newBookedTime]);
        }

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
            filterTime={filterPassedTime} // Deshabilita horas pasadas si es hoy
            minTime={
              (() => {
                const now = new Date();
                const min = new Date(); // Crea una nueva instancia de Date para minTime
                const selectedDayOfWeek = formData.appointmentDateTime ? formData.appointmentDateTime.getDay() : null;

                if (selectedDayOfWeek === 6) { // Sábado
                    min.setHours(9, 0, 0, 0); // Desde las 9:00 AM
                } else { // Lunes a Viernes (y por defecto si no hay fecha seleccionada)
                    min.setHours(9, 0, 0, 0); // Desde las 9:00 AM
                }

                // Si la fecha seleccionada es HOY, asegura que la hora mínima no sea anterior a la hora actual.
                // Esto es vital para evitar el error "minTime.getHours is not a function"
                // y para que no se puedan seleccionar horas ya pasadas en el día actual.
                if (formData.appointmentDateTime && formatDateToISO(formData.appointmentDateTime) === formatDateToISO(now)) {
                    // Si la hora base (9AM) es menor que la hora actual, O
                    // si es la misma hora (9AM) pero los minutos base son menores que los actuales,
                    // ajusta min a la hora actual.
                    if (min.getHours() < now.getHours() || (min.getHours() === now.getHours() && min.getMinutes() < now.getMinutes())) {
                        min.setHours(now.getHours(), now.getMinutes(), 0, 0);
                    }
                }
                return min;
              })()
            }
            maxTime={
              (() => {
                const max = new Date(); // Crea una nueva instancia de Date para maxTime
                const selectedDayOfWeek = formData.appointmentDateTime ? formData.appointmentDateTime.getDay() : null;

                if (selectedDayOfWeek === 6) { // Sábado
                    max.setHours(16, 0, 0, 0); // Hasta las 4:00 PM (16:00h)
                } else { // Lunes a Viernes (y por defecto si no hay fecha seleccionada)
                    max.setHours(19, 0, 0, 0); // Hasta las 7:00 PM (19:00h)
                }
                return max;
              })()
            }
            excludeTimes={
                bookedSlotsForSelectedDate.map(slot => {
                    const [h, m] = slot.split(':').map(Number);
                    const d = new Date();
                    d.setHours(h, m, 0, 0);
                    return d;
                })
            }
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