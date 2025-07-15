// pages/index.tsx

import Head from 'next/head';
import { useState, ChangeEvent } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Definición de tipos para los detalles de captura de PayPal
interface PayPalCaptureDetailsForIndex {
  payer: {
    name: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
  };
  id?: string;
  status?: string;
}

// Tipo para las props que recibe Home, incluyendo paypalSdkLoaded
interface HomePageProps {
  paypalSdkLoaded: boolean;
}

// Tipo para los elementos de FAQ
interface FAQItem {
  question: string;
  answer: string;
}

const DynamicPayPalButton = dynamic(() => import('../components/PayPalButton'), {
  ssr: false,
  loading: () => <p className="text-center text-gray-600">Cargando botón de pago de PayPal...</p>,
});

// Define faqItems FUERA del componente Home para evitar el error de referencia antes de la definición
const faqItems: FAQItem[] = [
  {
    question: '¿Qué es el ITBIS y cómo me afecta?',
    answer: 'El Impuesto sobre Transferencias de Bienes Industrializados y Servicios (ITBIS) es el equivalente al Impuesto al Valor Agregado (IVA) en República Dominicana. Grava la transferencia e importación de bienes industrializados, así como la prestación de servicios. Te afecta al comprar productos o contratar servicios gravados, ya que el impuesto se añade al precio final.',
  },
  {
    question: '¿Quiénes deben pagar Impuesto Sobre la Renta (ISR)?',
    answer: 'El Impuesto Sobre la Renta (ISR) debe ser pagado por toda persona natural o jurídica residente o domiciliada en la República Dominicana, y por las sucesiones indivisas, por las rentas de fuente dominicana y de fuente mundial. Las personas físicas no residentes también deben pagar por rentas de fuente dominicana.',
  },
  {
    question: '¿Qué tipo de gastos son deducibles de impuestos?',
    answer: 'Los gastos deducibles son aquellos necesarios para la obtención de la renta gravada y para la conservación de su fuente. Incluyen, entre otros, salarios, alquileres de oficina, servicios profesionales, compra de insumos, y gastos de depreciación. Es crucial mantener registros detallados para su correcta justificación.',
  },
  {
    question: '¿Cómo puedo registrarme como contribuyente ante la DGII?',
    answer: 'Puedes registrarte como contribuyente obteniendo tu Registro Nacional de Contribuyentes (RNC) ante la Dirección General de Impuestos Internos (DGII). Esto puede hacerse de forma presencial en las oficinas de la DGII o, para algunos casos, a través de su oficina virtual. Necesitarás documentos de identificación y, para empresas, los documentos constitutivos.',
  },
];

export default function Home({ paypalSdkLoaded }: HomePageProps) {
  const [isMobileMenuOpen, setIsMobileMenuMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedProductPrice, setSelectedProductPrice] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomAmountSelected, setIsCustomAmountSelected] = useState<boolean>(true); // Se establece en true por defecto

  const toggleMobileMenu = () => {
    setIsMobileMenuMenuOpen(!isMobileMenuOpen);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Define tus opciones de pago aquí
  const paymentOptions = [
    { id: 'monto_abierto', name: 'Aporte (Monto Abierto)', price: '' }, // Precio vacío para indicar que es personalizable
  ];

  const handlePaymentSuccess = (details: PayPalCaptureDetailsForIndex) => {
    console.log('Pago exitoso en Index.tsx:', details);
    const payerName = details.payer?.name?.given_name || 'Estimado Contribuyente';
    alert(`¡Gracias por tu pago, ${payerName}!`);
    setSelectedProductPrice(null);
    setCustomAmount('');
    setIsCustomAmountSelected(true); // Mantener el monto personalizado seleccionado después del éxito
  };

  const handlePaymentError = (error: Error) => {
    console.error('Error de pago en Index.tsx:', error);
    alert('Hubo un problema con tu pago. Por favor, inténtalo de nuevo.');
  };

  const handleCustomAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setCustomAmount(value);
      if (parseFloat(value) > 0) {
        setSelectedProductPrice(value);
      } else {
        setSelectedProductPrice(null);
      }
    }
  };

  // Función para manejar la selección de una opción de pago
  const handleOptionSelect = (price: string, isCustom: boolean) => {
    // Solo "monto_abierto" está disponible ahora, por lo que siempre será personalizado
    setIsCustomAmountSelected(true);
    setSelectedProductPrice(customAmount && parseFloat(customAmount) > 0 ? customAmount : null);
  };

  const finalPaymentAmount = isCustomAmountSelected ? customAmount : selectedProductPrice;
  const isPayPalButtonEnabled = finalPaymentAmount && parseFloat(finalPaymentAmount) > 0;

  return (
    <>
      <Head>
        <title>ImpuestosRD: Tu Asesoría Fiscal Confiable en República Dominicana</title>
        <meta name="description" content="ImpuestosRD te guía en tus obligaciones fiscales en República Dominicana. Asesoría confiable y personalizada sobre ITBIS, Impuesto Sobre Renta, gastos y registros." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-white text-gray-800 font-sans">
        {/* --- Header (Barra de Navegación) --- */}
        <header className="bg-blue-800 text-white p-4 shadow-md">
          <nav className="container mx-auto flex justify-between items-center">
            <div className="text-6xl font-bold">ImpuestosRD</div>
            <ul className="hidden md:flex space-x-6">
              <li><a href="#servicios" className="hover:text-red-400 transition duration-300">Servicios Fiscales</a></li>
              <li><a href="#porque-elegirnos" className="hover:text-red-400 transition duration-300">Por Qué Elegirnos</a></li>
              <li><a href="#testimonios" className="hover:text-red-400 transition duration-300">Testimonios</a></li>
              <li key="agendar-desktop">
                <Link href="/agendar" className="hover:text-red-400 transition duration-300">
                  Agenda tu Consulta
                </Link>
              </li>
              <li><a href="#contacto" className="hover:text-red-400 transition duration-300">Contacto</a></li>
            </ul>
            <button onClick={toggleMobileMenu} className="md:hidden text-white text-3xl focus:outline-none">
              &#9776;
            </button>
          </nav>
          {isMobileMenuOpen && (
            <div className="md:hidden bg-blue-700 mt-4 py-2">
              <ul className="flex flex-col items-center space-y-4">
                <li key="servicios-mobile"><a onClick={toggleMobileMenu} href="#servicios" className="block text-white hover:text-red-400 transition duration-300 py-2">Servicios Fiscales</a></li>
                <li key="porque-elegirnos-mobile"><a onClick={toggleMobileMenu} href="#porque-elegirnos" className="block text-white hover:text-red-400 transition duration-300 py-2">Por Qué Elegirnos</a></li>
                <li key="testimonios-mobile"><a onClick={toggleMobileMenu} href="#testimonios" className="block text-white hover:text-red-400 transition duration-300 py-2">Testimonios</a></li>
                <li key="agendar-mobile">
                  <Link href="/agendar" className="block text-white hover:text-red-400 transition duration-300 py-2" onClick={toggleMobileMenu}>
                    Agenda tu Consulta
                  </Link>
                </li>
                <li key="contacto-mobile"><a onClick={toggleMobileMenu} href="#contacto" className="block text-white hover:text-red-400 transition duration-300 py-2">Contacto</a></li>
              </ul>
            </div>
          )}
        </header>

        {/* --- Sección Hero --- */}
        <section className="relative bg-cover bg-center h-[600px] flex items-center justify-center text-white"
          style={{ backgroundImage: "url('/images/impuestos.jpg')" }}> {/* La ruta de la imagen se ha actualizado aquí */}
          <div className="absolute inset-0 bg-black opacity-50"></div>

          <div className="container mx-auto text-center z-10 p-4">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-white">
              Simplifica tus Impuestos: <br /> Asesoría Fiscal Expertos en RD.
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              En ImpuestosRD te ofrecemos claridad y confianza para gestionar tus obligaciones fiscales <br className="hidden md:inline" /> sobre ITBIS, Impuesto Sobre Renta, gastos deducibles y registros.
            </p>
            <Link href="/agendar" className="inline-block bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
              ¡Agenda tu Consulta Gratuita!
            </Link>
          </div>
        </section>

        {/* --- Sección Servicios --- */}
        ---
        <section id="servicios" className="py-20 bg-gray-50">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-2">Tu Tranquilidad Fiscal, Nuestra Misión.</h2>
            <p className="text-xl text-gray-700 mb-12">Asesoría profesional para individuos y empresas.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">📈</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Declaración de Impuesto Sobre Renta (ISR)</h3>
                <p className="text-gray-600">Te asistimos en la preparación y presentación de tu declaración anual de ISR, asegurando el cumplimiento y optimización fiscal.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">🧾</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Gestión de ITBIS</h3>
                <p className="text-gray-600">Manejo eficiente de tu ITBIS, desde la declaración mensual hasta la recuperación de créditos fiscales.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">💸</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Asesoría en Gastos Deducibles</h3>
                <p className="text-gray-600">Identificamos y optimizamos tus gastos deducibles para reducir tu carga impositiva, siempre dentro del marco legal.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">📝</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Registros Contables y Fiscales</h3>
                <p className="text-gray-600">Organizamos y mantenemos tus registros contables y fiscales al día, esenciales para auditorías y cumplimiento.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Planificación Fiscal Estratégica</h3>
                <p className="text-gray-600">Desarrollamos estrategias fiscales personalizadas para minimizar riesgos y maximizar tus beneficios a largo plazo.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div className="text-red-600 text-5xl mb-4">🏛️</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">Trámites ante la DGII</h3>
                <p className="text-gray-600">Te representamos y gestionamos todos tus trámites ante la Dirección General de Impuestos Internos (DGII).</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Sección Por Qué Elegirnos --- */}
        ---
        <section id="porque-elegirnos" className="py-20 bg-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-12">ImpuestosRD: Tu Socio en Cumplimiento Fiscal.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Expertos en Normativa Dominicana</h3>
                <p className="text-gray-600 text-center">Conocimiento profundo de las leyes y regulaciones fiscales de la RD.</p>
              </div>
              <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">🤝</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Asesoría Personalizada</h3>
                <p className="text-gray-600 text-center">Soluciones fiscales adaptadas a tus necesidades específicas, ya seas individuo o empresa.</p>
              </div>
              <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">🗣️</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Comunicación Clara y Directa</h3>
                <p className="text-gray-600 text-center">Explicamos conceptos fiscales complejos de manera sencilla para tu comprensión.</p>
              </div>
              <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Confidencialidad y Seguridad</h3>
                <p className="text-gray-600 text-center">Manejamos tu información con la máxima discreción y seguridad.</p>
              </div>
              <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">💡</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Optimización Fiscal</h3>
                <p className="text-gray-600 text-center">Te ayudamos a aprovechar todas las oportunidades legales para reducir tu carga fiscal.</p>
              </div>
              <div className="flex flex-col items-center p-6">
                <div className="text-red-600 text-6xl mb-4">⏱️</div>
                <h3 className="text-2xl font-semibold text-blue-700 mb-2">Eficiencia y Puntualidad</h3>
                <p className="text-gray-600 text-center">Aseguramos que tus declaraciones y trámites se realicen a tiempo, evitando multas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Sección Testimonios --- */}
        ---
        <section id="testimonios" className="py-20 bg-gray-100">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-12">Historias de Éxito: Contribuyentes Tranquilos.</h2>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <p className="text-gray-700 italic text-lg mb-6">Gracias a ImpuestosRD, mi negocio ahora cumple con todas las normativas fiscales. Me ahorraron tiempo y preocupaciones, ¡totalmente recomendados!</p>
              <p className="font-semibold text-blue-700">- Juan P., Dueño de Pequeña Empresa (Santo Domingo)</p>
            </div>
          </div>
        </section>

        {/* --- Sección Preguntas Frecuentes (FAQ) --- */}
        ---
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-blue-800 text-center mb-12">¿Tienes Preguntas Fiscales? Tenemos las Respuestas.</h2>
            <div className="max-w-3xl mx-auto">
              {faqItems.map((item: FAQItem, index: number) => (
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

        {/* --- Sección CTA para Agendar Consulta --- */}
        ---
        <section id="agenda-consulta-cta" className="py-20 bg-gray-50">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-8">¡Agenda Tu Consulta Gratuita!</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              ¿Listo para poner tus impuestos en orden? Agenda una consulta gratuita con nuestros expertos para aclarar tus dudas fiscales.
            </p>
            <Link href="/agendar" className="inline-block bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
              Ir a la Página de Agendamiento
            </Link>
            <p className="text-md text-gray-500 mt-6">
              Serás redirigido a nuestra página de agendamiento para elegir la fecha y hora que mejor te convenga.
            </p>
          </div>
        </section>

        {/* --- Sección de Pago con PayPal - Cliente Elige --- */}
        ---
        <section className="py-20 bg-blue-100">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-blue-800 mb-8">Escríbenos y recibe una cotización desde 1000 pesos mensuales en adelante</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Ingresa un monto personalizado para apoyar nuestras iniciativas de educación fiscal:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {/* Solo el botón "Aporte (Monto Abierto)" permanece */}
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.price, option.id === 'monto_abierto')}
                  className={`
                    relative
                    w-36 h-36
                    rounded-lg
                    flex flex-col items-center justify-center
                    text-white
                    font-bold
                    text-center
                    shadow-lg
                    transition duration-300 ease-in-out
                    overflow-hidden
                    before:content-['']
                    before:absolute
                    before:inset-0
                    before:p-[3px]
                    before:bg-gradient-to-br
                    before:from-red-500
                    before:via-pink-500
                    before:to-red-700
                    before:z-0
                    ${(selectedProductPrice === option.price && !isCustomAmountSelected) || (option.id === 'monto_abierto' && isCustomAmountSelected)
                      ? 'transform scale-105' // Ligeramente más grande cuando está seleccionado
                      : 'hover:scale-105'
                    }
                  `}
                  style={{
                    // Fondo para el contenido del botón en sí, dentro del borde degradado
                    backgroundColor: 'rgb(220, 38, 38)', // red-600 de Tailwind
                  }}
                >
                  {/* Div interno para mantener el contenido y aplicar z-index sobre el pseudo-elemento del borde */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span className="text-lg">{option.name}</span>
                    {option.price && <span className="text-sm">(${option.price})</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* El input del monto personalizado siempre estará visible ya que es la única opción */}
            <div className="mt-6 mb-8 max-w-xs mx-auto">
              <label htmlFor="customAmountInput" className="block text-lg font-medium text-gray-700 mb-2">
                Ingresa tu monto en USD:
              </label>
              <input
                type="text"
                id="customAmountInput"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Ej: 10.00"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center text-xl font-bold"
              />
              {customAmount && parseFloat(customAmount) <= 0 && (
                <p className="text-red-500 text-sm mt-2">El monto debe ser mayor a 0.</p>
              )}
            </div>

            {isPayPalButtonEnabled ? (
              <div className="max-w-xs mx-auto">
                <p className="text-lg text-blue-700 mb-4">Estás a punto de pagar: <span className="font-bold">${parseFloat(finalPaymentAmount || '0').toFixed(2)}</span></p>
                <DynamicPayPalButton
                  productPrice={finalPaymentAmount!}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  paypalSdkLoaded={paypalSdkLoaded}
                />
              </div>
            ) : (
              <p className="text-lg text-gray-600">Por favor, ingresa un monto válido.</p>
            )}
          </div>
        </section>

        {/* --- Sección Contacto / CTA Final --- */}
        ---
        <section id="contacto" className="py-20 bg-blue-800 text-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl font-bold mb-8">¿Aún Tienes Dudas Fiscales? Contáctanos Directamente.</h2>
            <p className="text-xl mb-10">No dejes tus impuestos al azar. Permítenos ser tu guía experta para un cumplimiento fiscal óptimo.</p>

            <div className="mt-12 text-lg">
              <p>Puedes contactarnos vía email o teléfono:</p>
              <p className="mt-2">📧 <a href="mailto:info@impuestosrd.com" className="text-white hover:underline">info@impuestosrd.com</a></p>
              <p className="mt-2">📞 <a href="tel:+18091234567" className="text-white hover:underline">+1 (809) 123-4567</a></p>
            </div>
          </div>
        </section>

        {/* --- Footer --- */}
        ---
        <footer className="bg-blue-900 text-white py-8">
          <div className="container mx-auto text-center px-4">
            <div className="text-2xl font-bold mb-4">ImpuestosRD</div>
            <p className="mb-4">Tu Asesoría Fiscal en República Dominicana</p>

            <div className="flex justify-center space-x-6 mb-6">
              <a href="#" className="text-white hover:text-red-400 transition duration-300 text-2xl"><FaFacebookF /></a>
              <a href="#" className="text-white hover:text-red-400 transition duration-300 text-2xl"><FaInstagram /></a>
              <a href="#" className="text-white hover:text-red-400 transition duration-300 text-2xl"><FaLinkedinIn /></a>
            </div>

            <div className="flex justify-center space-x-6 text-sm mb-4">
              <a href="/politica-privacidad" className="text-white hover:underline">Política de Privacidad</a>
              <a href="/terminos-condiciones" className="text-white hover:underline">Términos y Condiciones</a>
            </div>

            <p className="text-sm">&copy; {new Date().getFullYear()} ImpuestosRD. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </>
  );
}