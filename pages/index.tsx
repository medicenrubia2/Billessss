// pages/index.tsx
import Head from 'next/head';
import { useState } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link'; // <--- ¡Importación del componente Link de Next.js!

// Ya no necesitamos importar GoogleCalendarBookingButton aquí

export default function Home() {
  // Corregido: el segundo elemento del array debe coincidir con el nombre de la función setter
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <--- ¡AQUÍ ESTABA EL TYPO!
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleMobileMenu = () => {
    // Usamos el nombre correcto de la función setter
    setIsMobileMenuOpen(!isMobileMenuOpen); // <--- ¡Y AQUÍ SE REFLEJÓ EL TYPO!
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqItems = [
    {
      question: '¿Cuánto tiempo tarda un proceso migratorio?',
      answer: 'El tiempo varía significativamente según el país, el tipo de visado y las circunstancias individuales. Durante tu consulta gratuita, te daremos una estimación más precisa.',
    },
    {
      question: '¿RHAI garantiza la aprobación del visado?',
      answer: 'Ninguna asesoría puede garantizar la aprobación de un visado, ya que la decisión final recae en las autoridades migratorias. Sin embargo, en RHAI maximizamos tus posibilidades al asegurar que tu solicitud cumpla con todos los requisitos y se presente de la manera más sólida posible.',
    },
    {
      question: '¿Qué tipo de casos migratorios manejan?',
      answer: 'En RHAI manejamos una amplia gama de casos, incluyendo visados de trabajo, estudio, reunificación familiar, residencia permanente y ciudadanía. Te invitamos a agendar una consulta para evaluar tu situación específica.',
    },
    {
      question: '¿Ofrecen asesoría en otros idiomas además del español?',
      answer: 'Nuestra especialidad es el apoyo a la comunidad hispana, por lo que nuestra comunicación principal es en español. Sin embargo, contamos con recursos para asistirte si necesitas soporte en otros idiomas.',
    },
  ];

  return (
    <>
      <Head>
        <title>RHAI: Red Hispana de Apoyo a los Inmigrantes | Tu Asesoría Migratoria Confiable</title>
        <meta name="description" content="RHAI te guía en tu proceso migratorio a Estados Unidos, Europa, Canadá y el resto del mundo. Asesoría confiable y personalizada para hispanos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-white text-gray-800 font-sans">
        {/* --- Header (Barra de Navegación) --- */}
        <header className="bg-blue-800 text-white p-4 shadow-md">
          <nav className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold">RHAI</div>
            <ul className="hidden md:flex space-x-6">
              <li><a href="#servicios" className="hover:text-red-400 transition duration-300">Servicios</a></li>
              <li><a href="#porque-elegirnos" className="hover:text-red-400 transition duration-300">Por Qué Elegirnos</a></li>
              <li><a href="#testimonios" className="hover:text-red-400 transition duration-300">Testimonios</a></li>
              {/* Enlace directo a la nueva página de agendamiento nativa */}
              <li>
                <Link href="/agendar">
                  <a className="hover:text-red-400 transition duration-300">Agenda tu Consulta</a>
                </Link>
              </li>
              <li><a href="#contacto" className="hover:text-red-400 transition duration-300">Contacto</a></li>
            </ul>
            {/* Botón para menú móvil */}
            <button onClick={toggleMobileMenu} className="md:hidden text-white text-3xl focus:outline-none">
              &#9776;
            </button>
          </nav>
          {/* Menú móvil desplegable */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-blue-700 mt-4 py-2">
              <ul className="flex flex-col items-center space-y-4">
                <li><a onClick={toggleMobileMenu} href="#servicios" className="block text-white hover:text-red-400 transition duration-300 py-2">Servicios</a></li>
                <li><a onClick={toggleMobileMenu} href="#porque-elegirnos" className="block text-white hover:text-red-400 transition duration-300 py-2">Por Qué Elegirnos</a></li>
                <li><a onClick={toggleMobileMenu} href="#testimonios" className="block text-white hover:text-red-400 transition duration-300 py-2">Testimonios</a></li>
                {/* Enlace directo a la nueva página de agendamiento nativa en móvil */}
                <li>
                  <Link href="/agendar">
                    <a onClick={toggleMobileMenu} className="block text-white hover:text-red-400 transition duration-300 py-2">Agenda tu Consulta</a>
                  </Link>
                </li>
                <li><a onClick={toggleMobileMenu} href="#contacto" className="block text-white hover:text-red-400 transition duration-300 py-2">Contacto</a></li>
              </ul>
            </div>
          )}
        </header>

        {/* --- Sección Hero --- */}
        <section className="relative bg-cover bg-center h-[600px] flex items-center justify-center text-white"
          style={{ backgroundImage: "url('/images/hero-background.jpg')" }}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          
          <div className="container mx-auto text-center z-10 p-4">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-white">
              Tu Nuevo Capítulo Empieza Aquí: <br /> Asesoría Migratoria Confiable.
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              En RHAI, la Red Hispana de Apoyo a los Inmigrantes, te guiamos con experiencia y cercanía en tu camino hacia <br className="hidden md:inline"/> Estados Unidos, Europa, Canadá y el resto del mundo.
            </p>
            {/* El botón en el Hero ahora enlaza directamente a la página de agendamiento nativa */}
            <Link href="/agendar">
              <a className="inline-block bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                ¡Agenda tu Consulta Gratuita!
              </a>
            </Link>
          </div>
        </section>

        {/* --- Sección Servicios --- */}
        <section id="servicios" className="py-20 bg-gray-50">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-12">Tu Éxito Migratorio, Nuestra Especialidad.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">💡</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Visados de Trabajo y Profesionales</h3>
                <p className="text-gray-600">Descubre oportunidades laborales y asegura tu futuro profesional con nuestra asesoría experta.</p>
              </div>
               <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">🎓</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Visados de Estudio</h3>
                <p className="text-gray-600">Accede a educación de calidad y experiencias internacionales con nuestra guía detallada.</p>
              </div>
               <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Reunificación Familiar</h3>
                <p className="text-gray-600">Une a tus seres queridos y construye un hogar sin fronteras con nuestro acompañamiento legal.</p>
              </div>
               <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">🏠</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Residencia y Ciudadanía</h3>
                <p className="text-gray-600">Tu camino hacia la estabilidad y los derechos plenos, paso a paso, con nuestro equipo.</p>
              </div>
               <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">⚖️</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Casos Especiales y Recursos</h3>
                <p className="text-gray-600">Soluciones a medida para situaciones complejas y orientación continua post-migratoria.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Sección Por Qué Elegirnos --- */}
        <section id="porque-elegirnos" className="py-20 bg-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-12">RHAI: Tu Apoyo Genuino en Cada Paso.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Experiencia Comprobada</h3>
                <p className="text-gray-600 text-center">Más de [X] años/casos de éxito guiando a familias como la tuya.</p>
              </div>
               <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">🤝</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Atención Personalizada</h3>
                <p className="text-gray-600 text-center">Cada historia es única. Te ofrecemos un plan a tu medida.</p>
              </div>
               <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">🗣️</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Comunicación Clara y en Tu Idioma</h3>
                <p className="text-gray-600 text-center">Rompiendo barreras lingüísticas y burocráticas para tu tranquilidad.</p>
              </div>
               <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">🌐</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Red Global de Apoyo</h3>
                <p className="text-gray-600 text-center">Conexiones y recursos en tus destinos soñados: EE. UU., Europa, Canadá y más.</p>
              </div>
               <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">💡</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Transparencia Total</h3>
                <p className="text-gray-600 text-center">Procesos claros, sin sorpresas ni costos ocultos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Sección Testimonios --- */}
        <section id="testimonios" className="py-20 bg-gray-100">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-12">Historias de Éxito: Familias que Ya Cumplieron su Sueño.</h2>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <p className="text-gray-700 italic text-lg mb-6">Gracias a Rhai, mi familia y yo estamos viviendo nuestro sueño en Canadá. Su apoyo y claridad fueron invaluables en cada etapa del proceso. ¡Altamente recomendados!</p>
              <p className="font-semibold text-blue-700">- María G., Colombia (Residente en Canadá)</p>
            </div>
          </div>
        </section>

        {/* --- Sección Preguntas Frecuentes (FAQ) --- */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-blue-800 text-center mb-12">¿Tienes Preguntas? Tenemos las Respuestas.</h2>
            <div className="max-w-3xl mx-auto">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200 py-4">
                  <button
                    className="flex justify-between items-center w-full text-left text-xl font-semibold text-blue-700 focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span>{item.question}</span>
                    <span>{openFAQ === index ? '-' : '+'}</span>
                  </button>
                  {openFAQ === index && (
                    <div className="mt-2 text-gray-600 animate-fadeIn">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Sección CTA para Agendar Consulta (AHORA ENLAZA A UNA PÁGINA SEPARADA) --- */}
        <section id="agenda-consulta-cta" className="py-20 bg-gray-50">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-8">¡Agenda Tu Consulta Gratuita!</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              ¿Listo para dar el siguiente paso? Agenda una consulta gratuita con nuestros expertos para diseñar el plan migratorio de tus sueños.
            </p>
            {/* Este botón ahora simplemente te lleva a la página /agendar */}
            <Link href="/agendar">
              <a
                className="inline-block bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
              >
                Ir a la Página de Agendamiento
              </a>
            </Link>
            <p className="text-md text-gray-500 mt-6">
              Serás redirigido a nuestra página de agendamiento para elegir la fecha y hora que mejor te convenga.
            </p>
          </div>
        </section>

        {/* --- Sección Contacto / CTA Final --- */}
        <section id="contacto" className="py-20 bg-blue-800 text-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold mb-8">¿Aún Tienes Dudas? Contáctanos Directamente.</h2>
            <p className="text-xl mb-10">No dejes tu futuro al azar. Permítenos ser tu guía experta en el camino hacia tu nuevo hogar.</p>
            
            <div className="mt-12 text-lg">
              <p>Puedes contactarnos vía email o teléfono:</p>
              <p className="mt-2">📧 <a href="mailto:inmigrationsrhai@gmail.com" className="text-white hover:underline">inmigrationsrhai@gmail.com</a></p>
              <p className="mt-2">📞 <a href="tel:+19292417449" className="text-white hover:underline">+1 (929) 241-7449</a></p>
            </div>
          </div>
        </section>

        {/* --- Footer --- */}
        <footer className="bg-blue-900 text-white py-8">
          <div className="container mx-auto text-center px-4">
            <div className="text-2xl font-bold mb-4">RHAI</div>
            <p className="mb-4">Red Hispana de Apoyo a los Inmigrantes</p>
            
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#" className="text-white hover:text-red-400 transition duration-300 text-2xl"><FaFacebookF /></a>
              <a href="#" className="text-white hover:text-red-400 transition duration-300 text-2xl"><FaInstagram /></a>
              <a href="#" className="text-white hover:text-red-400 transition duration-300 text-2xl"><FaLinkedinIn /></a>
            </div>

            <div className="flex justify-center space-x-6 text-sm mb-4">
              <a href="/politica-privacidad" className="text-white hover:underline">Política de Privacidad</a>
              <a href="/terminos-condiciones" className="text-white hover:underline">Términos y Condiciones</a>
            </div>

            <p className="text-sm">&copy; {new Date().getFullYear()} RHAI. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </>
  );
}