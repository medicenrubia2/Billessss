// components/GoogleCalendarBookingButton.jsx
import { useEffect, useRef, useState } from 'react';

const GoogleCalendarBookingButton = () => {
  // Usar useRef para el target, es más idiomático en React que document.getElementById en useEffect
  const targetRef = useRef(null);
  const [isButtonReady, setIsButtonReady] = useState(false); // Estado para controlar la visualización

  useEffect(() => {
    // Función para cargar un script dinámicamente
    const loadScript = (src, async = true, defer = true) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.defer = defer; // Asegurarse de que el script se ejecute después del parsing del HTML
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    // Función para cargar una hoja de estilos dinámicamente
    const loadStylesheet = (href) => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    };

    const initializeGoogleCalendarButton = async () => {
      try {
        // Cargar CSS
        await loadStylesheet('https://calendar.google.com/calendar/scheduling-button-script.css');
        // Cargar el script principal de Google Calendar
        await loadScript('https://calendar.google.com/calendar/scheduling-button-script.js');

        // Esperar a que 'calendar' y 'schedulingButton' estén disponibles en window
        // Esto es crucial porque los scripts se cargan de forma asíncrona.
        const checkInterval = setInterval(() => {
          if (window.calendar && window.calendar.schedulingButton && targetRef.current) {
            clearInterval(checkInterval); // Detener el intervalo una vez que esté listo

            // Asegúrate de que targetRef.current no sea null
            window.calendar.schedulingButton.load({
              url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3SCByedv_ZpLJOqn87fuocLEop8JbsiRH6ozJOw6pETjKvQd8yzY-yIVIcKY64JLnCfcqwOevP?gv=true',
              color: '#039BE5',
              label: 'Reservar una cita',
              target: targetRef.current, // Usar el ref aquí
            });
            setIsButtonReady(true); // Una vez que el botón se ha inicializado, podemos mostrarlo o su contenedor
          }
        }, 100); // Revisa cada 100ms

      } catch (error) {
        console.error("Error al cargar scripts de Google Calendar:", error);
        // Podrías mostrar un mensaje de error al usuario aquí
      }
    };

    initializeGoogleCalendarButton();

    // Limpieza al desmontar el componente
    return () => {
      // Eliminar scripts y stylesheets para evitar duplicados si el componente se monta/desmonta varias veces
      const script = document.querySelector('script[src="https://calendar.google.com/calendar/scheduling-button-script.js"]');
      if (script) script.remove();
      const link = document.querySelector('link[href="https://calendar.google.com/calendar/scheduling-button-script.css"]');
      if (link) link.remove();
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

  return (
    // Este div es el "target" para el script de Google Calendar.
    // El script de Google reemplazará o modificará el contenido de este div.
    // Podemos mostrar un loader o un mensaje mientras el botón no esté listo.
    <div ref={targetRef} className="my-8 flex justify-center">
      {!isButtonReady && (
        <button className="bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-bold cursor-not-allowed opacity-75">
          Cargando botón de reserva...
        </button>
      )}
      {/* El script de Google insertará el botón aquí una vez que esté listo */}
    </div>
  );
};

export default GoogleCalendarBookingButton;